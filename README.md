# Fullstack Web Application

This project is a fullstack web application that consists of a React frontend and a Node.js backend using PostgreSQL as the database. The application is containerized using Docker and Docker Compose.

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
  - [Running Tests](#running-tests)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

### Prerequisites

Make sure you have the following installed on your machine:

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/fullstack-webapp.git
   cd fullstack-webapp

2. **Build and start the Docker Containers.**

    docker-compose up --build

## Running the Application

    **Once the containers are up and running, you can access the application:**

    -Frontend: Open your browser and navigate to http://localhost:3000
    -Backend: The backend API is available at http://localhost:3001

## Technologies Used

**Frontend:**
- React
- TypeScript
- Material-UI
- Jest & React Testing Library

**Backend:**
- Node.js
- Express.js
- Sequelize ORM
- PostgreSQL
- Jest & Supertest

**Other:**
- Docker
- Docker Compose
