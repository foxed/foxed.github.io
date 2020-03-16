---
layout: post
title: GetNPUsers.py
---

I've been trying to familiarize myself with the numerous tools found in the Impacket library, many of which exploit vulnerabilities within Windows Active Directory structures. One such tool I have used in the past but failed to really understand is “GetNPUsers.py”. This post is a quick lesson on Kerberos ticketing and how GetNPUsers.py exploits users without pre-authentication enabled. 

While not necessarily a common vulnerability in the wild (as pre-authentication is enabled by default), I found learning about this vulnerability a paltable approach to understanding the basics of Kerberos ticketing.

First, we need to familiarize ourselves with Kerberos. Kerberos is a protocol for authentication that is the default method of authorization used by Microsoft Windows. It uses tickets to authenticate.

#### How does Kerberos authenticate?

The client sends a request to the KDC (Key Distribution Center). The KDC creates a TGT (ticket-granting ticket) for the client and encrypts it using the client’s password as the key, and sends the encrypted TGT back to the client. If the client decrypts the TGT (with their password), they keep the decrypted TGT as proof of their (the client’s) identity. 

While not the default state, there is a vulnerable option available for Kerberos users: 'Do not require Kerberos preauthentication' (UF_DONT_REQUIRE_PREAUTH). When pre-authentication is enabled, a time stamp is encrypted using the user’s password hash as an encryption key. If the KDC reads a valid time while using the user’s hash to decrypt the time stamp, the KDC knows that the request isn’t a replay of the previous request. [^1]

If pre-authentication is disabled, an attacker can send a request for authentication. The KDC will return an encrypted TGT from which an attacker can retrieve the vulnerable user's hash and crack it offline. The hash is in krb5asrep format. GetNPUsers.py is a script that does just that -- it enumerates for users within an AD domain that have PREAUTH disabled, and retrieves a krb5asrep hash from the requested TGT.

<a href="https://github.com/SecureAuthCorp/impacket/blob/master/examples/GetNPUsers.py">GetNPUSers.py</a>

The proper usage of the command would look something like the following: 

{% highlight bash %}
root@kali:/impacket/examples/> python GetNPUsers.py testAD.local/ -usersfile users.txt -format hashcat -outputfile hashes.testAD

{% endhighlight %}

Here, the usersfile flag is pointing to a list of guessed or known users in the target Windows domain, "testAD.local". If a user on the list has UF_DONT_REQUIRE_PREAUTH enabled, GetNPUsers.py receives a TGT from which a hash is then extracted and dumped into the hashes.testAD file. We can then attempt to crack the hash by using hashcat (as that is the output format we have chosen).

#### Useful reading

[^1]: <a href="https://social.technet.microsoft.com/wiki/contents/articles/23559.kerberos-pre-authentication-why-it-should-not-be-disabled.aspx">Kerberos Pre-Authentication: Why It Should Not Be Disabled</a>

<a href="https://www.harmj0y.net/blog/activedirectory/roasting-as-reps/">Roasting AS-REPS</a>

<a href="https://www.roguelynn.com/words/explain-like-im-5-kerberos/">Explain like I'm five: Kerberos</a>
