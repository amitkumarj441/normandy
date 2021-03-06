import apiFetch from '../utils/apiFetch.js';

export const REQUEST_IN_PROGRESS = 'REQUEST_IN_PROGRESS';
export const REQUEST_COMPLETE = 'REQUEST_COMPLETE';

export const RECIPES_RECEIVED = 'RECIPES_RECEIVED';
export const SINGLE_RECIPE_RECEIVED = 'SINGLE_RECIPE_RECEIVED';

export const SET_SELECTED_RECIPE = 'SET_SELECTED_RECIPE';

export const RECIPE_ADDED = 'RECIPE_ADDED';
export const RECIPE_UPDATED = 'RECIPE_UPDATED';
export const RECIPE_DELETED = 'RECIPE_DELETED';


const BASE_API_URL = '/api/v1/recipe/';

const API_REQUEST_SETTINGS = {
  credentials: 'include',
  headers: {
    'X-CSRFToken': document.getElementsByTagName('html')[0].dataset.csrf
  }
};

const apiRequestMap = {
  fetchAllRecipes(settings, getState) {
    if (shouldFetchRecipes(getState())) {
      return {
        url: BASE_API_URL,
        settings: {
          method: 'get'
        },
        actionOnSuccess: recipesReceived
      };
    } else {
      return null;
    }
  },

  fetchSingleRecipe(recipeInfo) {
    return {
      url: `${BASE_API_URL}${recipeInfo.recipeId}/`,
      settings: {
        method: 'get'
      },
      actionOnSuccess: singleRecipeReceived
    };
  },

  fetchSingleRevision(recipeInfo) {
    return {
      url: `/api/v1/recipe_version/${recipeInfo.revisionId}/`,
      settings: {
        method: 'get'
      },
      actionOnSuccess: singleRevisionReceived
    }
  },

  addRecipe(recipeInfo) {
    return {
      url: BASE_API_URL,
      settings: {
        data: recipeInfo,
        method: 'post'
      },
      actionOnSuccess: recipeAdded
    };
  },

  updateRecipe(recipeInfo) {
    return {
      url: `${BASE_API_URL}${recipeInfo.recipeId}/`,
      settings: {
        data: recipeInfo.recipe,
        method: 'patch'
      },
      actionOnSuccess: recipeUpdated
    };
  },

  deleteRecipe(recipeInfo) {
    return {
      url: `${BASE_API_URL}${recipeInfo.recipeId}/`,
      settings: {
        method: 'delete'
      },
      actionOnSuccess: recipeDeleted,
      successActionParams: recipeInfo.recipeId
    };
  }
};


function requestInProgress() {
  return {
    type: REQUEST_IN_PROGRESS
  };
}

function requestComplete(status) {
  return {
    type: REQUEST_COMPLETE,
    status: status
  };
}

function recipesReceived(recipes) {
  return {
    type: RECIPES_RECEIVED,
    recipes
  };
}

function singleRecipeReceived(recipe) {
  return {
    type: SINGLE_RECIPE_RECEIVED,
    recipe
  };
}

function singleRevisionReceived(revision) {
  return {
    type: SINGLE_RECIPE_RECEIVED,
    recipe: revision.recipe
  };
}

function recipeAdded(recipe) {
  return {
    type: RECIPE_ADDED,
    recipe
  };
}

function recipeUpdated(recipe) {
  return {
    type: RECIPE_UPDATED,
    recipe
  };
}

function recipeDeleted(recipeId) {
  return {
    type: RECIPE_DELETED,
    recipeId
  };
}

function shouldFetchRecipes(state) {
  if (state.controlApp.recipeListNeedsFetch === true &&
      state.controlApp.isFetching === false) {
    return true;
  } else {
    return false;
  }
}

function setSelectedRecipe(recipeId) {
  return {
    type: SET_SELECTED_RECIPE,
    recipeId
  };
}

function makeApiRequest(requestType, settings) {
  return (dispatch, getState) => {
    let apiRequestConfig = apiRequestMap[requestType](settings, getState);
    if (apiRequestConfig) {
      dispatch(requestInProgress());
      return apiFetch(apiRequestConfig.url, {
        ...API_REQUEST_SETTINGS,
        ...apiRequestConfig.settings
      })
      .then(response => {
        dispatch(requestComplete('success'));
        dispatch(apiRequestConfig.actionOnSuccess(apiRequestConfig.successActionParams || response));
      })
      .catch(() => {
        dispatch(requestComplete('failure'));
      });
    }
  };
}


export default {
  setSelectedRecipe,
  makeApiRequest,
};
