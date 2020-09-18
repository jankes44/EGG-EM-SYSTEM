package com.example.egg_em.operations.params;

import android.content.Context;

import com.example.egg_em.classes.types.RequestType;

public class TestParams {
    private int id;
    private String token;
    private RequestType requestType;
    private Context context;

    public TestParams(int id, String token, RequestType requestType, Context context) {
        this.id = id;
        this.token = token;
        this.requestType = requestType;
        this.context = context;
    }

    public int getId() {
        return id;
    }

    public String getToken() {
        return token;
    }

    public RequestType getRequestType() {
        return requestType;
    }

    public Context getContext() {
        return context;
    }
}
