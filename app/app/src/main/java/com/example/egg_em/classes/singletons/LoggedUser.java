package com.example.egg_em.classes.singletons;

import android.os.Build;

import androidx.annotation.RequiresApi;

import com.auth0.android.jwt.Claim;
import com.auth0.android.jwt.JWT;
import com.example.egg_em.classes.types.Access;

import java.util.Map;

@RequiresApi(api = Build.VERSION_CODES.N)
public class LoggedUser {
    private static LoggedUser mInstance = null;

    private int id;
    private String firstName;
    private String lastName;
    private Access access;


    public static LoggedUser getInstance(String jwt) {
        if (mInstance == null) {
            if (jwt == null){
                return null;
            }
            mInstance = LoggedUser.fromMap(new JWT(jwt).getClaims());
        }
        return mInstance;
    }

    private static LoggedUser fromMap(Map<String, Claim> claims) {
        LoggedUser user = new LoggedUser();
        user.id = claims.get("id").asInt();
        user.firstName = claims.get("first_name").asString();
        user.lastName = claims.get("last_name").asString();
        user.access = Access.valueOf(claims.get("access").asInt()).orElse(null);

        return user;
    }

    public int getId() {
        return id;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public Access getAccess() {
        return access;
    }
}
