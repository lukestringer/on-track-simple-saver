/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateGoalInput = {
  id?: string | null,
  startDate: string,
  startAmount: number,
  endDate: string,
  endAmount: number,
  owner?: string | null,
};

export type ModelGoalConditionInput = {
  startDate?: ModelStringInput | null,
  startAmount?: ModelFloatInput | null,
  endDate?: ModelStringInput | null,
  endAmount?: ModelFloatInput | null,
  owner?: ModelStringInput | null,
  and?: Array< ModelGoalConditionInput | null > | null,
  or?: Array< ModelGoalConditionInput | null > | null,
  not?: ModelGoalConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type ModelFloatInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type Goal = {
  __typename: "Goal",
  id: string,
  startDate: string,
  startAmount: number,
  endDate: string,
  endAmount: number,
  progressUpdates?: ModelProgressUpdateConnection | null,
  owner?: string | null,
  createdAt: string,
  updatedAt: string,
};

export type ModelProgressUpdateConnection = {
  __typename: "ModelProgressUpdateConnection",
  items:  Array<ProgressUpdate | null >,
  nextToken?: string | null,
};

export type ProgressUpdate = {
  __typename: "ProgressUpdate",
  id: string,
  date: string,
  amount: number,
  owner?: string | null,
  createdAt: string,
  updatedAt: string,
  goalProgressUpdatesId?: string | null,
};

export type UpdateGoalInput = {
  id: string,
  startDate?: string | null,
  startAmount?: number | null,
  endDate?: string | null,
  endAmount?: number | null,
  owner?: string | null,
};

export type DeleteGoalInput = {
  id: string,
};

export type CreateProgressUpdateInput = {
  id?: string | null,
  date: string,
  amount: number,
  owner?: string | null,
  goalProgressUpdatesId?: string | null,
};

export type ModelProgressUpdateConditionInput = {
  date?: ModelStringInput | null,
  amount?: ModelFloatInput | null,
  owner?: ModelStringInput | null,
  and?: Array< ModelProgressUpdateConditionInput | null > | null,
  or?: Array< ModelProgressUpdateConditionInput | null > | null,
  not?: ModelProgressUpdateConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  goalProgressUpdatesId?: ModelIDInput | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type UpdateProgressUpdateInput = {
  id: string,
  date?: string | null,
  amount?: number | null,
  owner?: string | null,
  goalProgressUpdatesId?: string | null,
};

export type DeleteProgressUpdateInput = {
  id: string,
};

export type ModelGoalFilterInput = {
  id?: ModelIDInput | null,
  startDate?: ModelStringInput | null,
  startAmount?: ModelFloatInput | null,
  endDate?: ModelStringInput | null,
  endAmount?: ModelFloatInput | null,
  owner?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelGoalFilterInput | null > | null,
  or?: Array< ModelGoalFilterInput | null > | null,
  not?: ModelGoalFilterInput | null,
};

export enum ModelSortDirection {
  ASC = "ASC",
  DESC = "DESC",
}


export type ModelGoalConnection = {
  __typename: "ModelGoalConnection",
  items:  Array<Goal | null >,
  nextToken?: string | null,
};

export type ModelProgressUpdateFilterInput = {
  id?: ModelIDInput | null,
  date?: ModelStringInput | null,
  amount?: ModelFloatInput | null,
  owner?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelProgressUpdateFilterInput | null > | null,
  or?: Array< ModelProgressUpdateFilterInput | null > | null,
  not?: ModelProgressUpdateFilterInput | null,
  goalProgressUpdatesId?: ModelIDInput | null,
};

export type ModelSubscriptionGoalFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  startDate?: ModelSubscriptionStringInput | null,
  startAmount?: ModelSubscriptionFloatInput | null,
  endDate?: ModelSubscriptionStringInput | null,
  endAmount?: ModelSubscriptionFloatInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionGoalFilterInput | null > | null,
  or?: Array< ModelSubscriptionGoalFilterInput | null > | null,
  goalProgressUpdatesId?: ModelSubscriptionIDInput | null,
  owner?: ModelStringInput | null,
};

export type ModelSubscriptionIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionFloatInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  in?: Array< number | null > | null,
  notIn?: Array< number | null > | null,
};

export type ModelSubscriptionProgressUpdateFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  date?: ModelSubscriptionStringInput | null,
  amount?: ModelSubscriptionFloatInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionProgressUpdateFilterInput | null > | null,
  or?: Array< ModelSubscriptionProgressUpdateFilterInput | null > | null,
  owner?: ModelStringInput | null,
};

export type CreateGoalMutationVariables = {
  input: CreateGoalInput,
  condition?: ModelGoalConditionInput | null,
};

export type CreateGoalMutation = {
  createGoal?:  {
    __typename: "Goal",
    id: string,
    startDate: string,
    startAmount: number,
    endDate: string,
    endAmount: number,
    progressUpdates?:  {
      __typename: "ModelProgressUpdateConnection",
      nextToken?: string | null,
    } | null,
    owner?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateGoalMutationVariables = {
  input: UpdateGoalInput,
  condition?: ModelGoalConditionInput | null,
};

export type UpdateGoalMutation = {
  updateGoal?:  {
    __typename: "Goal",
    id: string,
    startDate: string,
    startAmount: number,
    endDate: string,
    endAmount: number,
    progressUpdates?:  {
      __typename: "ModelProgressUpdateConnection",
      nextToken?: string | null,
    } | null,
    owner?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteGoalMutationVariables = {
  input: DeleteGoalInput,
  condition?: ModelGoalConditionInput | null,
};

export type DeleteGoalMutation = {
  deleteGoal?:  {
    __typename: "Goal",
    id: string,
    startDate: string,
    startAmount: number,
    endDate: string,
    endAmount: number,
    progressUpdates?:  {
      __typename: "ModelProgressUpdateConnection",
      nextToken?: string | null,
    } | null,
    owner?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateProgressUpdateMutationVariables = {
  input: CreateProgressUpdateInput,
  condition?: ModelProgressUpdateConditionInput | null,
};

export type CreateProgressUpdateMutation = {
  createProgressUpdate?:  {
    __typename: "ProgressUpdate",
    id: string,
    date: string,
    amount: number,
    owner?: string | null,
    createdAt: string,
    updatedAt: string,
    goalProgressUpdatesId?: string | null,
  } | null,
};

export type UpdateProgressUpdateMutationVariables = {
  input: UpdateProgressUpdateInput,
  condition?: ModelProgressUpdateConditionInput | null,
};

export type UpdateProgressUpdateMutation = {
  updateProgressUpdate?:  {
    __typename: "ProgressUpdate",
    id: string,
    date: string,
    amount: number,
    owner?: string | null,
    createdAt: string,
    updatedAt: string,
    goalProgressUpdatesId?: string | null,
  } | null,
};

export type DeleteProgressUpdateMutationVariables = {
  input: DeleteProgressUpdateInput,
  condition?: ModelProgressUpdateConditionInput | null,
};

export type DeleteProgressUpdateMutation = {
  deleteProgressUpdate?:  {
    __typename: "ProgressUpdate",
    id: string,
    date: string,
    amount: number,
    owner?: string | null,
    createdAt: string,
    updatedAt: string,
    goalProgressUpdatesId?: string | null,
  } | null,
};

export type GetGoalQueryVariables = {
  id: string,
};

export type GetGoalQuery = {
  getGoal?:  {
    __typename: "Goal",
    id: string,
    startDate: string,
    startAmount: number,
    endDate: string,
    endAmount: number,
    progressUpdates?:  {
      __typename: "ModelProgressUpdateConnection",
      nextToken?: string | null,
    } | null,
    owner?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListGoalsQueryVariables = {
  id?: string | null,
  filter?: ModelGoalFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListGoalsQuery = {
  listGoals?:  {
    __typename: "ModelGoalConnection",
    items:  Array< {
      __typename: "Goal",
      id: string,
      startDate: string,
      startAmount: number,
      endDate: string,
      endAmount: number,
      owner?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetProgressUpdateQueryVariables = {
  id: string,
};

export type GetProgressUpdateQuery = {
  getProgressUpdate?:  {
    __typename: "ProgressUpdate",
    id: string,
    date: string,
    amount: number,
    owner?: string | null,
    createdAt: string,
    updatedAt: string,
    goalProgressUpdatesId?: string | null,
  } | null,
};

export type ListProgressUpdatesQueryVariables = {
  id?: string | null,
  filter?: ModelProgressUpdateFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListProgressUpdatesQuery = {
  listProgressUpdates?:  {
    __typename: "ModelProgressUpdateConnection",
    items:  Array< {
      __typename: "ProgressUpdate",
      id: string,
      date: string,
      amount: number,
      owner?: string | null,
      createdAt: string,
      updatedAt: string,
      goalProgressUpdatesId?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type OnCreateGoalSubscriptionVariables = {
  filter?: ModelSubscriptionGoalFilterInput | null,
  owner?: string | null,
};

export type OnCreateGoalSubscription = {
  onCreateGoal?:  {
    __typename: "Goal",
    id: string,
    startDate: string,
    startAmount: number,
    endDate: string,
    endAmount: number,
    progressUpdates?:  {
      __typename: "ModelProgressUpdateConnection",
      nextToken?: string | null,
    } | null,
    owner?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateGoalSubscriptionVariables = {
  filter?: ModelSubscriptionGoalFilterInput | null,
  owner?: string | null,
};

export type OnUpdateGoalSubscription = {
  onUpdateGoal?:  {
    __typename: "Goal",
    id: string,
    startDate: string,
    startAmount: number,
    endDate: string,
    endAmount: number,
    progressUpdates?:  {
      __typename: "ModelProgressUpdateConnection",
      nextToken?: string | null,
    } | null,
    owner?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteGoalSubscriptionVariables = {
  filter?: ModelSubscriptionGoalFilterInput | null,
  owner?: string | null,
};

export type OnDeleteGoalSubscription = {
  onDeleteGoal?:  {
    __typename: "Goal",
    id: string,
    startDate: string,
    startAmount: number,
    endDate: string,
    endAmount: number,
    progressUpdates?:  {
      __typename: "ModelProgressUpdateConnection",
      nextToken?: string | null,
    } | null,
    owner?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreateProgressUpdateSubscriptionVariables = {
  filter?: ModelSubscriptionProgressUpdateFilterInput | null,
  owner?: string | null,
};

export type OnCreateProgressUpdateSubscription = {
  onCreateProgressUpdate?:  {
    __typename: "ProgressUpdate",
    id: string,
    date: string,
    amount: number,
    owner?: string | null,
    createdAt: string,
    updatedAt: string,
    goalProgressUpdatesId?: string | null,
  } | null,
};

export type OnUpdateProgressUpdateSubscriptionVariables = {
  filter?: ModelSubscriptionProgressUpdateFilterInput | null,
  owner?: string | null,
};

export type OnUpdateProgressUpdateSubscription = {
  onUpdateProgressUpdate?:  {
    __typename: "ProgressUpdate",
    id: string,
    date: string,
    amount: number,
    owner?: string | null,
    createdAt: string,
    updatedAt: string,
    goalProgressUpdatesId?: string | null,
  } | null,
};

export type OnDeleteProgressUpdateSubscriptionVariables = {
  filter?: ModelSubscriptionProgressUpdateFilterInput | null,
  owner?: string | null,
};

export type OnDeleteProgressUpdateSubscription = {
  onDeleteProgressUpdate?:  {
    __typename: "ProgressUpdate",
    id: string,
    date: string,
    amount: number,
    owner?: string | null,
    createdAt: string,
    updatedAt: string,
    goalProgressUpdatesId?: string | null,
  } | null,
};
