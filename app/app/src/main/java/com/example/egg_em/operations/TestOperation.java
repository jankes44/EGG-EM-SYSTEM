package com.example.egg_em.operations;

import android.content.Context;
import android.os.AsyncTask;
import android.util.Log;
import android.util.Pair;

import com.example.egg_em.classes.Security;
import com.example.egg_em.classes.Utilities;
import com.example.egg_em.classes.types.RequestType;
import com.example.egg_em.operations.params.TestParams;

import org.json.JSONException;
import org.json.JSONObject;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.LinkedList;
import java.util.List;
import java.util.Locale;

public class TestOperation extends AsyncTask<TestParams, Integer, Pair<Integer, JSONObject>> {

    final static String DOMAIN = "http://63.32.97.125:5000/api/tests/";

    @Override
    protected Pair<Integer, JSONObject> doInBackground(TestParams... params) {

        if(!Security.isNetworkAvailable(params[0].getContext())){
            return new Pair<>(404, new JSONObject());
        }

        String route = null;
        RequestType requestType = params[0].getRequestType();
        switch (requestType) {
            case LAST_TEST:
                route = String.format(Locale.ENGLISH, "lasttest/%d", params[0].getId());
                break;
        }

        String completeUrl = DOMAIN + route;
        Log.d("URL", "complete_url: "+ completeUrl);

        URL url;
        try {
            url = new URL(completeUrl);
        } catch (MalformedURLException e) {
            e.printStackTrace();
            return new Pair<>(903, new JSONObject());
        }

        String cleanToken = params[0].getToken()
                .replace("\"", "")
                .replace("\n", "");
        List<Pair<String, String>> headers = new LinkedList<>();
        headers.add(new Pair<>("Authorization", "Bearer " + cleanToken));

        return Utilities.getRequestForJson(url, headers);
    }
}
