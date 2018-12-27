import fetch from "isomorphic-fetch";

import NotAuthorizedError from "./NotAuthorizedError";

function graphQLRequest(xbApiUrl, query, variables, token) {
  const init = {
    method: "post",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: token,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  };

  return fetch(`${xbApiUrl}/graphql`, init)
    .then((response) => {
      if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response);
      }
      if (response.status === 401) {
        return Promise.reject(new NotAuthorizedError());
      }
      return Promise.reject(response);
    })
    .then(data => data.json())
    .then((data) => {
      if (!data) {
        // eslint-disable-next-line
        return Promise.reject([new Error("No data")]);
      }

      if (data.error) {
        // eslint-disable-next-line
        return Promise.reject([data.error]);
      }

      if (data.errors) {
        return Promise.reject(data.errors);
      }

      return Promise.resolve(data.data);
    });
}

export default function (xbApiUrl) {
  return (query, variables, token) => {
    return graphQLRequest(xbApiUrl, query, variables, token);
  };
}
