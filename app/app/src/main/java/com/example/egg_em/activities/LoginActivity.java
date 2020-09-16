package com.example.egg_em.activities;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;

import com.example.egg_em.R;
import com.example.egg_em.classes.Security;
import com.example.egg_em.operations.UserOperation;
import com.example.egg_em.operations.params.UserParams;

import java.io.UnsupportedEncodingException;
import java.security.NoSuchAlgorithmException;
import java.util.concurrent.ExecutionException;

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
            Security.createToast("Fill In All Fields", this);
            return null;
        }

        int login = 0;
        UserParams params;
        try{
            params = new UserParams(email, password, this, "login");
            login = new UserOperation().execute(params).get();
        } catch (InterruptedException | ExecutionException | NoSuchAlgorithmException | UnsupportedEncodingException e) {
            Security.createToast("Login Error", this);
            return null;
        }

        switch (login){
            case 200: {
//                LOGIN OK
                //TODO create landing page after successful login
                risIntent = new Intent(this, LoginActivity.class);
            }
            break;

            case 400:{
                Security.createToast("Incorrect Username/Password", this);
                risIntent = null;
            }
            break;

            case 404:{
                Security.createToast("No Internet Connection", this);
                risIntent = null;
            }
        }
        return risIntent;
    }

}