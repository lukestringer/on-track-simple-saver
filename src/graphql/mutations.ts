/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createGoal = /* GraphQL */ `mutation CreateGoal(
  $input: CreateGoalInput!
  $condition: ModelGoalConditionInput
) {
  createGoal(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateGoalMutationVariables,
  APITypes.CreateGoalMutation
>;
export const updateGoal = /* GraphQL */ `mutation UpdateGoal(
  $input: UpdateGoalInput!
  $condition: ModelGoalConditionInput
) {
  updateGoal(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateGoalMutationVariables,
  APITypes.UpdateGoalMutation
>;
export const deleteGoal = /* GraphQL */ `mutation DeleteGoal(
  $input: DeleteGoalInput!
  $condition: ModelGoalConditionInput
) {
  deleteGoal(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteGoalMutationVariables,
  APITypes.DeleteGoalMutation
>;
export const createProgressUpdate = /* GraphQL */ `mutation CreateProgressUpdate(
  $input: CreateProgressUpdateInput!
  $condition: ModelProgressUpdateConditionInput
) {
  createProgressUpdate(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateProgressUpdateMutationVariables,
  APITypes.CreateProgressUpdateMutation
>;
export const updateProgressUpdate = /* GraphQL */ `mutation UpdateProgressUpdate(
  $input: UpdateProgressUpdateInput!
  $condition: ModelProgressUpdateConditionInput
) {
  updateProgressUpdate(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateProgressUpdateMutationVariables,
  APITypes.UpdateProgressUpdateMutation
>;
export const deleteProgressUpdate = /* GraphQL */ `mutation DeleteProgressUpdate(
  $input: DeleteProgressUpdateInput!
  $condition: ModelProgressUpdateConditionInput
) {
  deleteProgressUpdate(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteProgressUpdateMutationVariables,
  APITypes.DeleteProgressUpdateMutation
>;
