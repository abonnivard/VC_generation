# VC project

This is a simple interface designed for testing purposes only, allowing you to create, sign, and use Verifiable Credentials (VC).
## Features

- **VC Creation**: Create electronic credentials compliant with W3C standards by specifying relevant information such as name, institution, issuance date, etc.
- **VC Signing**: Sign electronic credentials using different signing methods including JSON-LD ZKP with BBS+, JSON - JWT, JSON-LD with LD Signature and ZKP- CL.
- **VC Verification**: Verify the authenticity of electronic credentials by submitting them for online verification or using a QR code.

## Usage

1. **Signup/Login**: Create an account or login to the interface.
2. **VC Creation**: Fill in the necessary fields to create a new electronic credential.
3. **VC Signing**: Choose the appropriate signing method and sign the electronic credential.
4. **VC Verification**: Submit the electronic credential for online verification or use a QR code to verify its authenticity.

## Development

The VC interface is built using the Django framework and modern front-end technologies such as HTML, CSS, and JavaScript.
The VC interface relies on a Node.js API for all signature, verification, and cryptographic key generation functionalities. This API provides secure and efficient methods for handling sensitive cryptographic operations.



## Authors

- [Adrien Bonnivard](https://github.com/abonnivard)
- [Valentine Delhome](https://github.com/valentinedelhome)
