### Quick start

This application is use to implement the different types of digital signatures.
Each subdirectory contains a different type of digital signature. Divided into three files : functions, sign and verify.

Execute the following command to start the application:

```bash
make
```

Alternatively, you can run the following commands:
brew install tree
```bash
npm install
npm start
```

# Dependencies

All are npm packages.

### JSON Web Token (JWT)

The VC JWT is a specification for creating VC credentials in the format of JWT that is signed with a JWS. JWT are JSON files that have 3 parts: a Header that specifies the encryption algorithms and type of the JSON data, a Payload that details the attributes or the content of the token and a Signature that can be verified to ensure the integrity of the payload and token.
```bash
did-jwt
jsonwebtoken
```

### JSON-LD ZKP with BBS+
JSON-LD credentials with LDS signatures do not provide any privacy enhancing mechanisms. In matter of fact, LDS may support attribute individual signing which can enable selective disclosure, however the current implementations of JSON-LD with LDS neither support zero-knowledge nor selevtive disclosure. In matter of fact, LDS signatures alone can not provide selective disclosure in the first place because the credential system they provide lacks the infrastructure and protocols needed to achieve it. But Since JSON-LD credentials support multiple signatue schemes, JSON-LD credentials with BBS+ signatures. Although the work on BBS+ credentials is relatively new (Late 2020) related to AnonCreds or other exisiting credentials, most working VC communities seem to converge to BBS+ credentials according to different interviews.
```bash
@mattrglobal/bbs-signatures
```

### ZKP-CL

Unlike JWT, ZKP-CL credentials use the JSON representation with CL signatures to enable ZKP and selective disclosure. In matter of fact, the Anonymous Credentials specified as credential by Hyperledger Indy and later turned into a standalone standard AnonCreds by Hyperledger foundation.
```bash
@hyperledger/aries-askar-nodejs
@hyperledger/anoncreds-nodejs
@aries-framework/indy-vdr
```

### JSON-LD with LD signatures
JSON-LD credentials support wider types of signatures and of bases, as mentioned above.
While the JWT credentials are based on the IANA registry for credential definition, a JSON-LD credential needs to have a definition published on a web-based open registry or on a given website. The definition of the credential is specified within the VC metadata as @context and @type which contains URL pointing to where the definition is stored as a resource, generally a JSON or a JSON- LD file.
```bash
jsonld-signatures
```