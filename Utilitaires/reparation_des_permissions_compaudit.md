zsh compinit: insecure files, run compaudit for list.
Ignore insecure files and continue [y] or abort
compinit [n]? ncompinit: initialization aborted

┌──(charles㉿kali)-[~]
└─$ compaudit | xargs chmod g-w,o-w
There are insecure files:
chmod: changing permissions of '/usr/share/zsh/vendor-completions/_antigravity': Operation not permitted

┌──(charles㉿kali)-[~]
└─$ sudo compaudit | xargs chmod g-w,o-w
[sudo] password for charles:
sudo: compaudit: command not found
chmod: missing operand after ‘ g-w,o-w’
Try 'chmod --help' for more information.

┌──(charles㉿kali)-[~]
└─$ compaudit | xargs sudo chmod g-w,o-w
There are insecure files:

┌──(charles㉿kali)-[~]
└─$

┌──(charles㉿kali)-[~]
└─$ compaudit
There are insecure files:
/usr/share/zsh/vendor-completions/_antigravity

┌──(charles㉿kali)-[~]
└─$ sudo chmod g-w,o-w /usr/share/zsh/vendor-completions/_antigravity

┌──(charles㉿kali)-[~]
└─$ sudo chown root:root /usr/share/zsh/vendor-completions/_antigravity

┌──(charles㉿kali)-[~]
└─$ exec zsh

┌──(charles㉿kali)-[~]
└─$
