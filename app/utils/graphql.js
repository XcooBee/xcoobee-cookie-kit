import fetch from "isomorphic-fetch";

export default function graphQLRequest(query, variables, token) {
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

  return fetch(`${xcoobeeConfig.apiUrl}/graphql`, init)
    .then((response) => {
      if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response);
      }
      return Promise.reject(response);
    })
    .then(data => data.json())
    .then((data) => {
      if (!data) {
        return Promise.reject();
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
