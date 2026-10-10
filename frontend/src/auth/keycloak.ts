import Keycloak from 'keycloak-js'

// Keycloak is configured to connect to your local Keycloak server.
// Update these values to match your realm/client configuration.
const keycloak = new Keycloak({
  url: 'http://localhost:9090',
  realm: 'event-ticket-platform',
  clientId: 'event-ticket-frontend',
})

export default keycloak
