package com.example.egg_em.operations;

import android.os.AsyncTask;
import android.util.Pair;

import com.example.egg_em.classes.Security;
import com.example.egg_em.classes.Utilities;
import com.example.egg_em.operations.params.TestParams;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.LinkedList;
import java.util.List;
import java.util.Locale;

public class GetLastTestOperation extends AsyncTask<TestParams, Integer, Pair<Integer, String>> {

    final static String URL = "http://63.32.97.125:5000/api/tests/lasttest/%d";

    @Override
    protected Pair<Integer, String> doInBackground(TestParams... params) {
        if(!Security.isNetworkAvailable(params[0].getContext())){
            return new Pair<>(404, "");
        }

        String completeUrl = String.format(Locale.ENGLISH, URL, params[0].getId());
        java.net.URL url;
        try {
            url = new URL(completeUrl);
        } catch (MalformedURLException e) {
            e.printStackTrace();
            return new Pair<>(903, "");
        }

        String cleanToken = params[0].getToken()
                .replace("\"", "")
                .replace("\n", "");
        List<Pair<String, String>> headers = new LinkedList<>();
        headers.add(new Pair<>("Authorization", "Bearer " + cleanToken));


        return Utilities.getRequestForString(url, headers);
    }
}
