import fetch from "isomorphic-fetch";

import { apiUrl } from "../utils";

export function graphQLRequest(query, variables) {
  const init = {
    method: "post",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query,
      variables
    }),
  };

  return fetch(`${apiUrl}/graphql`, init)
    .then(response => {
      if (response.status >= 200 && response.status < 400) {
        return Promise.resolve(response);
      }

      return Promise.reject(response);
    })
    .then(data => data.json())
    .then(data => console.log(data))
    .then(data => Promise.resolve(data.data));
}
