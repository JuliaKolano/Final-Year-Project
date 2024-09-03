export const getUserChats = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      Chats {
        items {
          chat {
            id
            users {
              items {
                user {
                  id
                }
              }
            }
          }
        }
      }
    }
  }
`;
