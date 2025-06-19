/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getGoal = /* GraphQL */ `query GetGoal($id: ID!) {
  getGoal(id: $id) {
    id
    startDate
    startAmount
    endDate
    endAmount
    progressUpdates {
      nextToken
      __typename
    }
    owner
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<APITypes.GetGoalQueryVariables, APITypes.GetGoalQuery>;
export const listGoals = /* GraphQL */ `query ListGoals(
  $id: ID
  $filter: ModelGoalFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listGoals(
    id: $id
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      id
      startDate
      startAmount
      endDate
      endAmount
      owner
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<APITypes.ListGoalsQueryVariables, APITypes.ListGoalsQuery>;
export const getProgressUpdate = /* GraphQL */ `query GetProgressUpdate($id: ID!) {
  getProgressUpdate(id: $id) {
    id
    date
    amount
    goalProgress
    owner
    createdAt
    updatedAt
    goalProgressUpdatesId
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetProgressUpdateQueryVariables,
  APITypes.GetProgressUpdateQuery
>;
export const listProgressUpdates = /* GraphQL */ `query ListProgressUpdates(
  $id: ID
  $filter: ModelProgressUpdateFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listProgressUpdates(
    id: $id
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      id
      date
      amount
      goalProgress
      owner
      createdAt
      updatedAt
      goalProgressUpdatesId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListProgressUpdatesQueryVariables,
  APITypes.ListProgressUpdatesQuery
>;
