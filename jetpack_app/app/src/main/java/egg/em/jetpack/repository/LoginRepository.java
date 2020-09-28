package egg.em.jetpack.repository;

import java.util.concurrent.Executor;

public class LoginRepository {

    private final Executor executor;

    public LoginRepository(LoginResponseParser responseParser, Executor executor) {
        this.responseParser = responseParser;
        this.executor = executor;
    }

    public void makeLoginRequest(final String jsonBody, final RepositoryCallback<LoginResponse> callback) {
        executor.execute(new Runnable() {
            @Override
            public void run() {
                try {
                    Result<LoginResponse> result = makeSynchronousLoginRequest(jsonBody);
                    callback.onComplete(result);
                } catch (Exception e) {
                    Result<LoginResponse> errorResult = new Result.Error<>(e);
                    callback.onComplete(errorResult);
                }

            }
        });
    }


}
