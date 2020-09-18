package com.example.egg_em.operations.params;

import android.content.Context;

import java.io.UnsupportedEncodingException;
import java.security.NoSuchAlgorithmException;

public class UserParams {
    String email;
    String password;
    String requestType;
    Context context;

    public UserParams(String email, String password, Context context, String requestType) throws UnsupportedEncodingException, NoSuchAlgorithmException {
        this.email = email;
//        this.password = Security.SHA1(password);
        this.password = password;
        this.context = context;
        this.requestType = requestType;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getRequestType() {
        return requestType;
    }

    public Context getContext() {
        return context;
    }
}

