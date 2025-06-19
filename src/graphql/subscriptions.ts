/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateGoal = /* GraphQL */ `subscription OnCreateGoal(
  $filter: ModelSubscriptionGoalFilterInput
  $owner: String
) {
  onCreateGoal(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateGoalSubscriptionVariables,
  APITypes.OnCreateGoalSubscription
>;
export const onUpdateGoal = /* GraphQL */ `subscription OnUpdateGoal(
  $filter: ModelSubscriptionGoalFilterInput
  $owner: String
) {
  onUpdateGoal(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateGoalSubscriptionVariables,
  APITypes.OnUpdateGoalSubscription
>;
export const onDeleteGoal = /* GraphQL */ `subscription OnDeleteGoal(
  $filter: ModelSubscriptionGoalFilterInput
  $owner: String
) {
  onDeleteGoal(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteGoalSubscriptionVariables,
  APITypes.OnDeleteGoalSubscription
>;
export const onCreateProgressUpdate = /* GraphQL */ `subscription OnCreateProgressUpdate(
  $filter: ModelSubscriptionProgressUpdateFilterInput
  $owner: String
) {
  onCreateProgressUpdate(filter: $filter, owner: $owner) {
    id
    date
    amount
    owner
    createdAt
    updatedAt
    goalProgressUpdatesId
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateProgressUpdateSubscriptionVariables,
  APITypes.OnCreateProgressUpdateSubscription
>;
export const onUpdateProgressUpdate = /* GraphQL */ `subscription OnUpdateProgressUpdate(
  $filter: ModelSubscriptionProgressUpdateFilterInput
  $owner: String
) {
  onUpdateProgressUpdate(filter: $filter, owner: $owner) {
    id
    date
    amount
    owner
    createdAt
    updatedAt
    goalProgressUpdatesId
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateProgressUpdateSubscriptionVariables,
  APITypes.OnUpdateProgressUpdateSubscription
>;
export const onDeleteProgressUpdate = /* GraphQL */ `subscription OnDeleteProgressUpdate(
  $filter: ModelSubscriptionProgressUpdateFilterInput
  $owner: String
) {
  onDeleteProgressUpdate(filter: $filter, owner: $owner) {
    id
    date
    amount
    owner
    createdAt
    updatedAt
    goalProgressUpdatesId
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteProgressUpdateSubscriptionVariables,
  APITypes.OnDeleteProgressUpdateSubscription
>;
