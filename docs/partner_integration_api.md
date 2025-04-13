# NegraRosa Partner Integration API

This document outlines the API specifications for third-party partners to integrate with the NegraRosa Inclusive Security Framework. The framework uses the "I AM WHO I AM" NFT as a central identity token that authorizes data sharing and verification activities.

## Core Integration Principles

1. **User-Controlled Data**: All data sharing requires explicit user permission
2. **Minimal Data Exposure**: Partners only receive the specific data necessary for their function
3. **NFT-Based Authentication**: The NFT serves as the authentication mechanism
4. **Transparent Logging**: All data exchanges are logged and viewable by users
5. **Contextual Understanding**: Partners receive context added by users alongside raw data points

## Authentication

### NFT Authentication Flow

```
┌─────────────┐      ┌────────────┐      ┌──────────────┐
│   Partner   │      │  NegraRosa │      │ User's Wallet│
│   Service   │      │  Platform  │      │    or NFT    │
└──────┬──────┘      └─────┬──────┘      └──────┬───────┘
       │                   │                    │
       │   1. Request      │                    │
       │   Connection      │                    │
       │──────────────────>│                    │
       │                   │                    │
       │                   │  2. Request NFT    │
       │                   │   Authorization    │
       │                   │───────────────────>│
       │                   │                    │
       │                   │  3. Sign Challenge │
       │                   │<───────────────────│
       │                   │                    │
       │  4. Connection    │                    │
       │     Token         │                    │
       │<──────────────────│                    │
       │                   │                    │
       │  5. API Access    │                    │
       │  with Token       │                    │
       │──────────────────>│                    │
       │                   │                    │
```

### API Key Structure

All partners receive a unique API key for each user connection:
```
ngrs_{user_nft_id}_{partner_id}_{permission_hash}
```

## Identity Verification API

### Request User Verification

```http
POST /api/v1/partners/verification/request
Content-Type: application/json
Authorization: Bearer {partner_api_key}

{
  "verification_type": "identity|background|financial|health",
  "scope": ["personal_info", "address_history", "employment"],
  "callback_url": "https://partner-domain.com/callback"
}
```

### Receive Verification Result

```http
POST {callback_url}
Content-Type: application/json
X-NegraRosa-Signature: {hmac_signature}

{
  "verification_id": "ver_12345abcde",
  "status": "approved|limited|denied",
  "user_nft_id": "IAM#25798",
  "verification_data": {
    "personal_info": {
      "name": "Thomas Anderson",
      "verified": true,
      "verification_level": 3,
      "user_explanation": null
    },
    "address_history": {
      "verified": true,
      "verification_level": 2,
      "addresses_count": 3,
      "user_explanation": "Relocated for job opportunities in tech sector"
    }
  },
  "restrictions": {
    "requires_additional_verification": false,
    "limited_access": false
  },
  "timestamp": "2025-04-10T15:30:45Z"
}
```

## Contextual Data API

Partners can receive not just raw data but also user explanations for specific data points.

### Request User Context

```http
GET /api/v1/partners/user/{user_nft_id}/context
Content-Type: application/json
Authorization: Bearer {partner_api_key}

{
  "data_points": ["employment_gaps", "address_changes", "financial_events"]
}
```

### Context Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "user_nft_id": "IAM#25798",
  "contextual_data": {
    "employment_gaps": {
      "raw_data": "8 month gap in 2022",
      "user_explanation": "Was pursuing education during this period",
      "verification_level": 2
    },
    "address_changes": {
      "raw_data": "3 addresses in last 5 years",
      "user_explanation": "Relocated for work opportunities",
      "verification_level": 3
    }
  },
  "timestamp": "2025-04-10T15:32:45Z"
}
```

## NFT Identity Validation

Partners can validate the authenticity of a user's NFT identity token.

### Validate NFT Token

```http
POST /api/v1/partners/nft/validate
Content-Type: application/json
Authorization: Bearer {partner_api_key}

{
  "nft_id": "IAM#25798",
  "blockchain_address": "0x7Ed1A5A5680c11578325E6565e2ad136BD32d37d"
}
```

### Validation Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "valid": true,
  "verification_level": 3,
  "issuance_date": "2025-03-15T10:20:30Z",
  "last_updated": "2025-04-10T14:15:20Z",
  "permissions": {
    "identity_verification": true,
    "background_check": true,
    "financial_verification": true,
    "health_screening": false
  }
}
```

## Partner Integration Registration

To become a partner on the NegraRosa platform, organizations must implement the above APIs and register:

### Partner Registration

```http
POST /api/v1/partners/register
Content-Type: application/json
Authorization: Bearer {negraRosa_admin_key}

{
  "partner_name": "Clear by Clearview AI",
  "partner_type": "identity",
  "api_endpoint": "https://api.clearview.ai/v1/identities",
  "callback_url": "https://api.clearview.ai/callbacks/negraRosa",
  "available_permissions": [
    {
      "id": "face-verify",
      "name": "Facial Verification", 
      "description": "Use facial recognition to verify identity"
    },
    {
      "id": "face-recover",
      "name": "Recovery Access", 
      "description": "Use face as account recovery method"
    },
    {
      "id": "biometric-store",
      "name": "Store Biometric Template", 
      "description": "Maintain secure biometric template"
    }
  ],
  "data_requirements": ["facial_biometrics", "government_id"],
  "privacy_policy_url": "https://clearview.ai/privacy",
  "terms_of_service_url": "https://clearview.ai/terms"
}
```

## Integration Process for New Partners

1. **Application**: Partner applies through the NegraRosa Partner Portal
2. **API Implementation**: Partner implements the required API endpoints
3. **Security Review**: NegraRosa conducts security and privacy assessment
4. **Sandbox Testing**: Testing in a sandbox environment with sample NFTs
5. **User Consent Flow**: Setup of user-facing consent and permission screens
6. **Go Live**: Official launch as a NegraRosa identity partner

## Data Sharing Principles

1. **Granular Permissions**: Users control exactly which data elements are shared
2. **Revocable Access**: Users can revoke partner access at any time
3. **Purpose Limitation**: Data can only be used for the specified purpose
4. **Transparent Usage**: Partners must log and report all data usage
5. **Data Minimization**: Only necessary data is shared for each specific purpose

---

This API specification enables third-party partners to integrate with the NegraRosa Inclusive Security Framework while ensuring user data remains protected and under user control at all times. The NFT-based identity tokens serve as the cornerstone of this ecosystem, enabling portable identity verification across various services.