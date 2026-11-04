# API Playground --- Project Specification

## 1. Project overview

**Project name:** API Playground\
**Type:** Developer tool / API testing client\
**Purpose:** Build a lightweight application that lets developers
compose HTTP requests, send them to APIs, inspect responses, and save
useful requests for later.

API Playground is inspired by tools such as Postman and Insomnia, but
the initial scope is intentionally smaller. The goal is a reliable,
well-structured portfolio project---not a full Postman replacement.

## 2. Goals

The MVP should let a user:

-   Enter a request URL and choose an HTTP method.
-   Configure query parameters, headers, authorization, and a JSON
    request body.
-   Send the request through a backend request executor.
-   Inspect the response status, duration, headers, and body.
-   Read JSON responses in a formatted, easy-to-view panel.
-   See useful loading, validation, network, and timeout errors.
-   Save requests and group them into collections.
-   Review recent request history.

## 3. Out of scope for the MVP

Do not implement these unless explicitly requested later:

-   Team collaboration, shared workspaces, or user accounts.
-   Cloud synchronization.
-   Pre-request scripts or arbitrary JavaScript execution.
-   Request chaining or advanced workflow automation.
-   GraphQL, WebSocket, or gRPC clients.
-   Full API documentation generation.
-   AI features.
-   A public unrestricted proxy service.

Keep the architecture extensible, but avoid premature complexity.

## 4. Proposed technology stack

### Frontend

-   React
-   TypeScript
-   Vite
-   Tailwind CSS
-   Zustand (or React Context if simpler for initial scope)
-   Monaco Editor or a lightweight code editor for JSON bodies and
    responses

### Backend

-   Node.js
-   TypeScript
-   Express
-   Axios for outbound HTTP requests
-   Zod for request configuration validation

### Persistence

-   SQLite for saved collections, requests, and local history
-   Prisma ORM is optional; use it if it improves clarity without
    slowing MVP delivery

### Testing

-   Vitest for frontend logic
-   Node test runner or Jest for backend
-   Supertest for Express route tests

Use current stable compatible versions. Keep client and server
independently runnable during development.

## 5. Architecture

The frontend must not directly execute arbitrary user-entered API URLs
from the browser. It sends a request configuration to the local Express
backend. The backend validates and executes the outbound request, then
returns a normalized result.

High-level flow:

1.  User composes a request in React.
2.  Client sends the request configuration to `POST /api/execute`.
3.  Express validates the configuration.
4.  Request executor checks URL and network safety rules.
5.  Axios sends the outbound request.
6.  Backend captures status, headers, body, and duration.
7.  Backend returns a normalized response object.
8.  React displays the response.

### Security requirements

The backend is a proxy and can create SSRF risk. Implement basic
protections from the beginning:

-   Allow only `http:` and `https:` URL protocols.
-   Reject localhost, loopback, link-local, and private-network
    destinations (IPv4 and IPv6).
-   Resolve hostnames and validate resulting IP addresses; account for
    DNS rebinding where feasible.
-   Revalidate destinations on redirects; disable redirects initially or
    limit and validate each redirect.
-   Set a configurable request timeout.
-   Limit request body size and response size.
-   Do not log authorization headers, cookies, or secret environment
    values.
-   Do not expose this backend as an unrestricted public proxy.
-   Return clear errors for blocked destinations.
-   Keep secrets out of source control. Include `.env.example`, never
    real credentials.

If robust SSRF protection cannot be completed for the MVP, keep the
backend bound to localhost and document that limitation. Do not deploy a
public instance without the protections.

## 6. MVP feature requirements

### 6.1 Request builder

-   Method selector: GET, POST, PUT, PATCH, DELETE.
-   URL field.
-   Send button.
-   Query parameters editor with key, value, and enabled/disabled state.
-   Headers editor with key, value, and enabled/disabled state.
-   Authorization tab supporting:
    -   No Auth
    -   Bearer Token
    -   Basic Auth
-   Body tab supporting:
    -   None
    -   JSON
-   JSON body editor with basic validation.
-   Preserve request configuration when switching tabs or methods.
-   Disabled rows must not be included in the request.

### 6.2 Response viewer

Display: - HTTP status code and status text when available. -
Success/error visual state. - Total request duration. - Response body
size if practical. - Response body in a formatted viewer. - Response
headers. - Raw/text view for non-JSON responses. - Copy response
action. - Empty state before a request is sent. - Loading state while a
request is running. - Useful error display for timeouts, network
failures, invalid URLs, and blocked destinations.

Do not assume every response is JSON. Handle text, empty, and binary
responses safely. For MVP, binary response bodies may be represented
with a message and metadata rather than rendered.

### 6.3 Request history

-   Store a limited number of recent requests (for example, latest 50).
-   Include method, URL, timestamp, and outcome.
-   Clicking an entry restores its request configuration.
-   Allow clearing history.
-   Avoid storing secret values in history by default, or clearly warn
    and provide a way to omit them.

### 6.4 Collections and saved requests

-   Create, rename, and delete collections.
-   Save a request with a user-defined name.
-   List saved requests in a sidebar.
-   Load a saved request into the request builder.
-   Update an existing saved request.
-   Delete a saved request.
-   Persist data in SQLite.

### 6.5 Environments (MVP-light, optional after core features)

-   Environment has a name and key/value variables.
-   Support variable interpolation in URL, query values, headers, and
    JSON body, such as `{{baseUrl}}`.
-   Provide local environment selection.
-   Do not expose secret values in logs.
-   If this delays core functionality, defer it to a later milestone.

## 7. Backend API contract

### `POST /api/execute`

Purpose: Execute one HTTP request.

Example input:

``` json
{
  "method": "GET",
  "url": "https://jsonplaceholder.typicode.com/posts/1",
  "headers": [
    { "key": "Accept", "value": "application/json", "enabled": true }
  ],
  "queryParams": [
    { "key": "userId", "value": "1", "enabled": false }
  ],
  "bodyType": "none",
  "body": "",
  "auth": {
    "type": "none"
  }
}
```

Example normalized output:

``` json
{
  "status": 200,
  "statusText": "OK",
  "durationMs": 142,
  "headers": {
    "content-type": "application/json"
  },
  "body": {
    "userId": 1,
    "id": 1,
    "title": "Example title",
    "body": "Example body"
  },
  "bodyType": "json"
}
```

The exact response schema can be adjusted during implementation, but
document it and use TypeScript types shared between client and server
where practical.

Notes: - Axios normally treats non-2xx responses as errors. Configure
execution so HTTP error responses (such as 404 or 500) are still
returned to the client as inspectable responses. - Distinguish an HTTP
response with an error status from a network failure where no response
was received. - Do not return backend stack traces to the browser.

### Collections and history endpoints

Use RESTful local endpoints, for example:

-   `GET /api/collections`
-   `POST /api/collections`
-   `PATCH /api/collections/:id`
-   `DELETE /api/collections/:id`
-   `POST /api/collections/:id/requests`
-   `PATCH /api/requests/:id`
-   `DELETE /api/requests/:id`
-   `GET /api/history`
-   `DELETE /api/history`

Adjust endpoint design if a simpler coherent contract is chosen.
Validate all inputs.

## 8. User interface layout

Aim for a clean, compact developer-tool UI. A dark theme is a reasonable
initial choice, but prioritize readability and keyboard usability.

Suggested layout:

-   **Left sidebar:** Collections, saved requests, history.
-   **Top request row:** Method dropdown, URL input, Send button.
-   **Request tabs:** Params, Headers, Authorization, Body.
-   **Response area:** Body, Headers; status and duration shown
    prominently.
-   **JSON editor/viewer:** Syntax highlighting and formatting.

The interface should be responsive enough for laptop and tablet widths.
Desktop is the primary target.

## 9. Suggested repository structure

``` text
api-playground/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── RequestBuilder/
│   │   │   ├── ResponseViewer/
│   │   │   ├── KeyValueEditor/
│   │   │   └── Sidebar/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── types/
│   │   └── App.tsx
│   └── package.json
├── server/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   │   └── httpExecutor.ts
│   │   ├── middleware/
│   │   ├── validators/
│   │   ├── database/
│   │   └── app.ts
│   └── package.json
├── docs/
│   └── architecture.md
├── screenshots/
├── .env.example
├── .gitignore
├── README.md
└── PROJECT.md
```

This is a starting point. Do not create empty folders for features that
are not implemented yet.

## 10. Milestones

### Milestone 1 --- Project setup

-   Initialize repository and client/server TypeScript projects.
-   Configure scripts and environment variables.
-   Ensure both projects run locally.
-   Add a basic health endpoint.

### Milestone 2 --- Interface shell

-   Build the sidebar, request row, tabs, and response panel.
-   Use mock response data initially.
-   Add loading and empty states.

### Milestone 3 --- Request execution

-   Implement `POST /api/execute`.
-   Validate request configuration.
-   Implement outbound request execution, timeout and safety controls.
-   Connect frontend to backend.
-   Test against JSONPlaceholder and HTTPBin.

### Milestone 4 --- Response handling

-   Format JSON responses.
-   Display status, duration, headers, and text responses.
-   Handle HTTP errors separately from network errors.

### Milestone 5 --- Persistence

-   Add SQLite.
-   Implement saved requests and collections.
-   Add request history.

### Milestone 6 --- Quality and portfolio readiness

-   Write tests for validation, executor behavior, and routes.
-   Test error cases.
-   Add screenshots and a useful README.
-   Document limitations and future work.

Prioritize a working request/response flow before implementing
collections or advanced features.

## 11. Acceptance criteria

The MVP is considered complete when:

-   User can send GET and POST requests to a safe public test API.
-   User can configure enabled query parameters and headers.
-   User can send a JSON body for methods that support it.
-   Response status, duration, headers, and body are visible.
-   JSON is formatted; text and empty responses are handled.
-   HTTP 4xx/5xx responses are displayed rather than treated as generic
    network failures.
-   Timeout and network errors produce useful messages.
-   Request configurations can be saved and restored.
-   Collections persist after server restart.
-   The backend rejects unsafe destination URLs.
-   Core behavior has automated tests.
-   README explains setup, architecture, features, security limitations,
    and includes screenshots.

## 12. Development instructions for the coding assistant

-   Work incrementally, one milestone at a time.
-   Before coding a milestone, briefly explain the intended changes and
    files.
-   Do not implement all features in one pass.
-   Keep TypeScript strict; avoid `any` unless justified.
-   Prefer small, reusable components and services.
-   Do not add dependencies without explaining why they are needed.
-   Write tests for important logic as it is implemented.
-   Run tests and type checks after changes.
-   Do not claim a feature is complete unless it is implemented and
    verified.
-   Keep README and project documentation updated.
-   Ask for clarification when a significant product decision is
    genuinely ambiguous; otherwise use sensible defaults and document
    them.
-   Do not commit or push unless explicitly asked.
-   Never put real API keys, tokens, or passwords in code or repository
    files.

## 13. Future enhancements

Possible later additions:

-   Import/export collections in a compatible JSON format.
-   More authentication types (API key, OAuth 2.0).
-   Request chaining and test assertions.
-   API schema import (OpenAPI).
-   Generate documentation from saved requests.
-   Compare responses between environments.
-   Optional AI-assisted explanation of API errors.

## 14. Learning objectives

By completing this project, the developer should gain experience with:

-   HTTP methods, headers, query parameters, status codes, and JSON.
-   Frontend/backend separation.
-   REST API design.
-   Request validation and error handling.
-   Async programming and network timeouts.
-   Database persistence.
-   TypeScript types across application layers.
-   Automated testing.
-   Security considerations for proxy-style services.
-   Technical documentation and portfolio presentation.
