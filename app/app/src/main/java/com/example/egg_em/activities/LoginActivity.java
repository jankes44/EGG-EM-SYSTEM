package com.example.egg_em.activities;

import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.util.Pair;
import android.widget.Button;
import android.widget.EditText;

import com.example.egg_em.R;
import com.example.egg_em.classes.singletons.LoggedUser;
import com.example.egg_em.classes.Utilities;
import com.example.egg_em.classes.types.RequestType;
import com.example.egg_em.operations.UserOperation;
import com.example.egg_em.operations.params.UserParams;

import java.io.UnsupportedEncodingException;
import java.security.NoSuchAlgorithmException;
import java.util.concurrent.ExecutionException;

@RequiresApi(api = Build.VERSION_CODES.N)
public class LoginActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.login);

        final Button signupButton = (Button) findViewById(R.id.sign_in_button);
        signupButton.setOnClickListener((v) -> {
            Intent login = createIntent();
            if (login != null){
                startActivity(login);
                finish();
            }
        });
    }

    Intent createIntent(){
        Intent risIntent = null;

        EditText emailInput = (EditText) findViewById(R.id.emailField);
        EditText passwordInput = (EditText) findViewById(R.id.passwordField);

        String email = emailInput.getText().toString();
        String password = passwordInput.getText().toString();

        if (email.isEmpty() || password.isEmpty()){
            Utilities.createToast("Fill In All Fields", this);
            return null;
        }

        Pair<Integer, String> login;
        UserParams params;
        try{
            params = new UserParams(email, password, this, RequestType.LOGIN);
            login = new UserOperation().execute(params).get();
        } catch (InterruptedException | ExecutionException | NoSuchAlgorithmException | UnsupportedEncodingException e) {
            Utilities.createToast("Login Error", this);
            return null;
        }

        switch (login.first){
            case 200: {
//                LOGIN OK
                //TODO create landing page after successful login
                LoggedUser.getInstance(login.second);
                risIntent = new Intent(this, MainLoggedActivity.class);
                Utilities.createToast("Login Successful", this);
            }
            break;

            case 400:{
                Utilities.createToast("Incorrect Username/Password", this);
                risIntent = null;
            }
            break;

            case 404:{
                Utilities.createToast("No Internet Connection", this);
                risIntent = null;
            }
        }
        return risIntent;
    }

}