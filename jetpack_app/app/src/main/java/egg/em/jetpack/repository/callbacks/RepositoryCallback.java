package egg.em.jetpack.repository.callbacks;

import egg.em.jetpack.model.result.Result;

interface RepositoryCallback<T> {
    void onComplete(Result<T> result);
}

