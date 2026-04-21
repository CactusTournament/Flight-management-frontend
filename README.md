# Flight Management Frontend

This is the React frontend for the Flight Management System, providing a user-friendly interface for managing flights, airports, aircraft, passengers, and more. It connects to the Spring Boot REST API backend and supports secure authentication, role-based access, and full CRUD operations.

## Features

- User authentication (login/signup) with validation
- Role-based access (admin/user)
- CRUD for Aircraft, Airports, Passengers, Flights, Airlines, Gates, Cities
- Responsive dashboard and navigation
- Error handling and feedback
- Modern UI with React 19, Vite, and CSS modules

## Tech Stack

- React 19
- Vite
- React Router 7
- CSS (modular, custom styles)


## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Backend API running (see backend README)


### Development

Install dependencies:

```sh
npm install
```

Start the development server:

```sh
npm run dev
```

The app will be available at http://localhost:5173 (or the next available port).

### Automated Testing

This project uses **Jest** and **React Testing Library** for automated tests covering all major components, context providers, and pages.

Run all tests:

```sh
npm test
```
or
```sh
npm run test
```

Test coverage reports are generated in the `coverage/` folder after running tests.

### Production Build

Build the static site:

```sh
npm run build
```

Preview the production build locally:

```sh
npm run preview
```


### Docker

Build the Docker image:

```sh
docker build -t flight-frontend .
```

Run the container:

```sh
docker run -p 3000:80 flight-frontend
```


### Deployment

For AWS deployment, build the frontend and upload the `dist/` folder to S3 for static hosting, or deploy the Docker image to ECS/EC2.


## API Configuration

The frontend expects the backend API to be available at a specific URL. Update API endpoints in `src/api/apiFetch.js` or use environment variables as needed for production.

For testing, API calls are mocked in `src/api/__mocks__/apiFetch.js`.
## Continuous Integration (CI)

This project uses **GitHub Actions** for continuous integration. All pushes and pull requests to the repository are automatically tested and built. See the `.github/workflows/` directory for configuration.



## Manual Test Scenarios

- Login as admin/user and verify dashboard access
- Create, edit, and delete Aircraft, Airports, Passengers, Flights
- Test signup and validation errors
- Check navigation and "Go Back" button on all pages
- Verify role-based access (admin vs user)


## Assignment Requirements

- Full CRUD for at least 4 entities
- Secure authentication and role-based access
- Separate frontend and backend repositories
- Responsive, user-friendly UI
- Documented manual test scenarios

## Authors

Brandon Maloney & SD14
