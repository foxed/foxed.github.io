---
layout: post
title: SQL Injection
---

A basic overview on SQL Injection. 

#### What is SQL?

SQL stands for “Structured Query Language”, which is used to communicate with a database. SQL statements are instructions for creating, retrieving, updating/altering and removing data within the database. 

#### What is SQL Injection?

SQL Injection is a type of injection attack that consists of insertion and injection of an SQL query via user-controlled input (aka untrusted sources). Web applications generally have portions of logic that are controlled by the results of a query. When these queries rely on user-supplied input (as many do), they can be improperly escaped, filtered, or validated, which results in the application being vulnerable to SQL Injection. An attacker can manipulate said vulnerable query to alter application logic.

SQL Injection can result in bypassed authentication, control of the database, disclosure of sensitive data, and in some scenarios an attacker can run commands on the vulnerable system (sometimes resulting in a reverse shell).

#### Example of (basic) SQL Injection

Say we have a web application that uses MySQL for its database. The application requires the user to log in. We log in with the username 'hacker' and the password 'goodpassword.' The corresponding SQL query would look something like the following:

{% highlight sql %}
SELECT * FROM users WHERE username=’hacker’ and password = ‘goodpassword’;
{% endhighlight %}

The user is supplying the values for the username and password to log into the application. This query causes the database to check for records within the users table where the username value is equal to hacker and the password value is equal to goodpassword. If the database finds a record that matches those values, the login is successful. If, say, the password value is incorrect, it may return an error message saying that the username/password combination is incorrect, and ‘hacker’ is unable to log in. 

So, we know that if the query returns at least one result, we’re logged in (as it would have found the corresponding record). If it returns no result, we’re still not in. Let’s take a wild guess here and assume that there is an ‘admin’ user, but we don’t know the password. Can we still log in? Yes. 

First, we need to break out of the query at hand using a single-quote. Then, we want to supply a new SQL statement that begins with OR, which in this instance I am using \|\| as a substitute for **OR** (old habits die hard). Next, we supply the meat of our statement, setting an ALWAYS TRUE statement with **1=1**. Finally, we comment out the remaining query with #. Note that \-\- can also be used for commenting in SQL.


We submit the following into the username login panel:
admin’||1=1#

And whatever in the password panel.

Our new SQL query looks something like:

{% highlight sql %}
SELECT * FROM user WHERE username=’admin’’ OR 1=1#
{% endhighlight %}

Everything after # is ignored (due to it being commented out with #), and we get logged in because the query retrieved at least one result by way of the statement being set to TRUE. In fact, in this example, we don’t even need a valid username, due to the OR statement. We are setting the whole statement to TRUE, and due to this I believe we get logged in as whoever possesses the first user id in the database (which generally corresponds to the admin user). *

\* _I'm working off my knowledge of these things and not actively hacking into a vulnerable web app so this (who we get logged in as) may be incorrect._

#### How to prevent SQL Injection?

Prepared statements (aka parameterized queries) are the safest route in protecting against SQL injection, but they are not infallible. A prepareted statement is a means of pre-compiling an SQL statement so that all that needs to be supplied on the user’s end are the parameters in order for the statement to be executed. Think of it as a template, with the application/developers specifying the query’s structure. The server preprocesses the request without parameters so that it knows what type of query it is (contrast this with dynamic queries, which are processed at run-time and therefore can be maliciously altered to suit the attacker’s needs).

Prepared statements ensure that an attacker is not able to change the intent of a query, due to the query having already been defined. How you write parameterized queries depends on what language your web application is written in and it goes beyond the scope of this wee blog post, but essentially, you construct an SQL query template with certain values (aka parameters) left unspecified, with '?' used for the value placeholders of said parameters. The database parses and compiles the SQL query and stores the result without executing it. When a user is interacting with the application and does an action that invokes the precompiled query, they supply their value for the parameter(s) (e.g. username and password), and the application binds the values to the parameters and executes the statement. 

Let’s revisit the above example. 

The attacker has submitted a username with a value of **‘Admin OR 1=1 #** in hopes of altering the query to bypass authentication. If a prepared statement is being used, however, instead of the SQL query being altered, the DB will search for a user with a username of **‘Admin OR 1=1 #**. The attacker would be unable to escape out of the SQL statement at hand and append their own SQL to do a malicious request.

OWASP has a great reference guide to get an idea of how parameterized queries are used, amongst other things:
<a href="https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html">OWASP Cheatsheet</a>

Prepared statements are not infallible, however. You must still ensure that proper escaping is used everywhere

In some scenarios (depending on the type of query being performed), prepared statements are not useful. In those cases, such as an ORDER BY query, whitelisting permitted input logic is the way to go. 

#### Useful Reading

<a href="https://portswigger.net/web-security/sql-injection">Portswigger SQL Injection</a>

The Web Application Hacker's Handbook by Dafydd Stuttard and Marcus Pinto

