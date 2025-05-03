# 🚀 Getting started with Strapi

Strapi comes with a full featured [Command Line Interface](https://docs.strapi.io/dev-docs/cli) (CLI) which lets you scaffold and manage your project in seconds.

### `develop`

Start your Strapi application with autoReload enabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-develop)

```
npm run develop
# or
yarn develop
```

### `start`

Start your Strapi application with autoReload disabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-start)

```
npm run start
# or
yarn start
```

### `build`

Build your admin panel. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-build)

```
npm run build
# or
yarn build
```

## ⚙️ Deployment

Strapi gives you many possible deployment options for your project including [Strapi Cloud](https://cloud.strapi.io). Browse the [deployment section of the documentation](https://docs.strapi.io/dev-docs/deployment) to find the best solution for your use case.

```
yarn strapi deploy
```

## 📚 Learn more

- [Resource center](https://strapi.io/resource-center) - Strapi resource center.
- [Strapi documentation](https://docs.strapi.io) - Official Strapi documentation.
- [Strapi tutorials](https://strapi.io/tutorials) - List of tutorials made by the core team and the community.
- [Strapi blog](https://strapi.io/blog) - Official Strapi blog containing articles made by the Strapi team and the community.
- [Changelog](https://strapi.io/changelog) - Find out about the Strapi product updates, new features and general improvements.

Feel free to check out the [Strapi GitHub repository](https://github.com/strapi/strapi). Your feedback and contributions are welcome!

## ✨ Community

- [Discord](https://discord.strapi.io) - Come chat with the Strapi community including the core team.
- [Forum](https://forum.strapi.io/) - Place to discuss, ask questions and find answers, show your Strapi project and get feedback or just talk with other Community members.
- [Awesome Strapi](https://github.com/strapi/awesome-strapi) - A curated list of awesome things related to Strapi.

---

<sub>🤫 Psst! [Strapi is hiring](https://strapi.io/careers).</sub>

# Pasha Backend

This is a Strapi application.

## Custom Authentication API Usage

The backend includes a custom authentication system that works with the database user table.

### Environment Variables

Add these to your `.env` file:

```
JWT_SECRET=your-secret-key-here
JWT_EXPIRES=1d
```

### Available Endpoints

#### 1. Login

**Endpoint:** `POST /api/auth/custom-login`

**Request Body:**
```json
{
  "username": "your_username",
  "password": "your_password"
}
```

**Success Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-uuid",
    "username": "your_username",
    "email": "your_email@example.com",
    "name": "Your Name",
    "surname": "Your Surname",
    "userType": "admin",
    "avatar": "optional-avatar-url"
  }
}
```

#### 2. Get Current User (Requires Authentication)

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer your-jwt-token
```

**Success Response:**
```json
{
  "id": "user-uuid",
  "username": "your_username",
  "email": "your_email@example.com",
  "name": "Your Name",
  "surname": "Your Surname",
  "phoneNumber": "5551234567",
  "userType": "admin",
  "avatar": "avatar-url",
  "credit": 100,
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

### Using the Authentication Token

For authenticated API requests, include the JWT token in the Authorization header:

```
Authorization: Bearer your-jwt-token
```

## Getting Started

### Development

Start the development server:

```
npm run develop
# or
yarn develop
```

### Build

Build the application for production:

```
npm run build
# or
yarn build
```

### Start

Start the production server:

```
npm run start
# or
yarn start
```
