package egg.em.jetpack.model;

import androidx.lifecycle.ViewModel;

import org.json.JSONException;
import org.json.JSONObject;

import egg.em.jetpack.repository.LoginRepository;

public class LoginViewModel extends ViewModel {
    private final LoginRepository loginRepository;

    public LoginViewModel(LoginRepository loginRepository) {
        this.loginRepository = loginRepository;
    }

    public void makeLoginRequest(String email, String password) throws JSONException {
        JSONObject jsonParams = new JSONObject();
        jsonParams.put("email", email);
        jsonParams.put("password", password);
        loginRepository.makeLoginRequest(jsonParams.toString(), new RepositoryCallback<LoginResponse>);
    }

}
