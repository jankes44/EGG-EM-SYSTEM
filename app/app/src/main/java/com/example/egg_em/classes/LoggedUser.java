package com.example.egg_em.classes;

import com.auth0.android.jwt.JWT;
import com.example.egg_em.classes.types.Access;
import com.fasterxml.jackson.databind.ObjectMapper;

public class LoggedUser {
    private static LoggedUser mInstance = null;

    private int id;
    private String firstName;
    private String lastName;
    private Access access;

    public static LoggedUser getInstance(String jwt) {
        if (mInstance == null) {
            ObjectMapper mapper = new ObjectMapper();
            mInstance = mapper.convertValue(new JWT(jwt).getClaims(), LoggedUser.class);
        }
        return mInstance;
    }
}
