# AES-256 Encryption Implications
----------------------

## What is AES-256 Encryption
AES-256 Encryption is an encryption standard that uses a 256-bit key to encrypt user data, typically financial, medical, or top-secret. 

AES-256 Encryption creates a unique key for each user. A user's key is stored encrypted on the server, decrypted after login with a masterkey, and then used to decrypt and encrypt their data.

AES-256 Encryption protects against data breaches, as resting data is stored encrypted, and cannot be decrypted without userkeys or the masterkey.

## How would AES-256 work for Orderly? Is it practical?
Implementing per AES-256 per-user encryption would require us to securely store a masterkey and a database of encryped user keys. Once a user logs in, the masterkey is used to decrypt their user key. Their key is then used to decrypt their user data. In typical AES-256 use-cases, Most of the user data is encrypted. This makes querying the database more complex since each entry is encrypted by a unique key. You can imagine how one analytical, business-side operation may now have to decrypt every user key and then decrypt each entry with the corresponding key. You can work around this constraint by selectively encrypting certain data. For Orderly, it's likely the most sensitive data stored is a shipping address. Even that is not that sensitive. Addresses may need to be frequently accessed depending on the type of business.
If street addresses are the only piece of data we need to encrypt, it's probably overkill to implement per-user encryption. We can instead accomplish street address encryption through a single, server-side key. Django would support this through the django-fernet-fields or django-cryptography libraries.
