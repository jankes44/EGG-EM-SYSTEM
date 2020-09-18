package com.example.egg_em.operations;

import android.os.AsyncTask;
import android.util.Log;
import android.util.Pair;

import com.example.egg_em.classes.Security;
import com.example.egg_em.classes.Utilities;
import com.example.egg_em.operations.params.UserParams;

import org.json.JSONException;
import org.json.JSONObject;

import java.net.MalformedURLException;
import java.net.URL;

// TODO explore deprecated Async Task constructor
public class UserOperation extends AsyncTask<UserParams, Integer, Pair<Integer, String>> {

    //Domain url
    final static String DOMAIN = "http://63.32.97.125:5000/users/";
    final static String ERROR = "ERROR";

    @Override
    protected  Pair<Integer, String> doInBackground(UserParams... params) {

        if(!Security.isNetworkAvailable(params[0].getContext())){
            return new Pair<>(404, "Error");
        }

        Log.d("NETWORK", "Network available");

        //request url creation
        String route = null;
        String requestType = params[0].getRequestType();
        switch (requestType) {
            case "login":
                route = "login/";
                break;
            case "register":
                route = "register/";
        }

        String complete_url = DOMAIN + route;
        Log.d("URL", "complete_url: "+complete_url);

        URL url;
        try {
            url = new URL(complete_url);
        } catch (MalformedURLException e) {
            e.printStackTrace();
            return new Pair<>(903, ERROR);

        }

        try {
            JSONObject jsonParams = new JSONObject();
            jsonParams.put("email", params[0].getEmail());
            jsonParams.put("password", params[0].getPassword());
            Log.d("JSON", "Json Params: "+jsonParams);

            return Utilities.postRequest(url, jsonParams);
            } catch (JSONException e) {
                e.printStackTrace();
                return new Pair<>(903, ERROR);
            }
    }
}
