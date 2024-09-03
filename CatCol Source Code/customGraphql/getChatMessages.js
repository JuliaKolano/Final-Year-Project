export const getChatMessages = /* GraphQL */ `
  query GetChat($id: ID!) {
    getChat(id: $id) {
      Messages {
        items {
          content
          userID
        }
      }
    }
  }
`;
