package com.example.egg_em.classes;

import android.app.Activity;
import android.util.Log;
import android.util.Pair;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.Toast;

import com.example.egg_em.R;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.ProtocolException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.List;

public class Utilities {

        public static Pair<Integer, String> postRequest(URL url, JSONObject params, List<Pair<String, String>> headers) {
            try {
                HttpURLConnection urlConnection = (HttpURLConnection) url.openConnection();
                urlConnection.setDoOutput(true);
                urlConnection.setRequestMethod("POST");
                urlConnection.setUseCaches(false);
                urlConnection.setConnectTimeout(10000);
                urlConnection.setReadTimeout(10000);
                urlConnection.setRequestProperty("Content-Type", "application/json");
                for (Pair<String, String> header : headers) {
                    urlConnection.setRequestProperty(header.first, header.second);
                }

                urlConnection.connect();

                OutputStreamWriter out = new OutputStreamWriter(urlConnection.getOutputStream());
                out.write(params.toString());
                out.close();

                int httpResult = urlConnection.getResponseCode();
                Log.d("RESPONSE CODE", Integer.toString(httpResult));

                StringBuilder sb = new StringBuilder();
                BufferedReader br = new BufferedReader(new InputStreamReader(
                        urlConnection.getInputStream(), StandardCharsets.UTF_8));
                String line;
                while ((line = br.readLine()) != null) {
                    sb.append(line).append("\n");
                }
                br.close();

                Log.d("RESPONSE", sb.toString());
                return new Pair<>(httpResult, sb.toString());

            } catch (ProtocolException e) {
                e.printStackTrace();
                return new Pair<>(462, "ERROR");
            } catch (IOException e) {
                e.printStackTrace();
                return new Pair<>(463, "ERROR");
            }
        }

        public static Pair<Integer, String> getRequest(URL url, List<Pair<String, String>> headers){
            try {
                HttpURLConnection urlConnection = (HttpURLConnection) url.openConnection();
                urlConnection.setRequestMethod("GET");
                urlConnection.setUseCaches(false);
                urlConnection.setConnectTimeout(10000);
                urlConnection.setReadTimeout(10000);
                for (Pair<String, String> header : headers) {
                    urlConnection.setRequestProperty(header.first, header.second);
                }

                urlConnection.connect();

                int httpResult = urlConnection.getResponseCode();
                Log.d("RESPONSE CODE", Integer.toString(httpResult));

                StringBuilder sb = new StringBuilder();
                BufferedReader br = new BufferedReader(new InputStreamReader(
                        urlConnection.getInputStream(), StandardCharsets.UTF_8));
                String line;
                while ((line = br.readLine()) != null) {
                    sb.append(line).append("\n");
                }
                br.close();

                Log.d("RESPONSE", sb.toString());
                return new Pair<>(httpResult, sb.toString());

            } catch (ProtocolException e) {
                e.printStackTrace();
                return new Pair<>(462, "ERROR");
            } catch (IOException e) {
                e.printStackTrace();
                return new Pair<>(463, "ERROR");
            }
        }

        public static Pair<Integer, JSONObject> getRequestForJson(URL url, List<Pair<String, String>> headers){
            headers.add(new Pair<>("Content-Type", "application/json;charset=UTF-8"));
            Pair<Integer, String> result = getRequest(url, headers);

            if (result.first.equals(HttpURLConnection.HTTP_OK)){
                try {
                    return new Pair<>(result.first, new JSONObject(result.second));
                } catch (JSONException e) {
                    e.printStackTrace();
                    return new Pair<>(461, new JSONObject());
                }
            }
            return new Pair<>(result.first, new JSONObject());
        }

        public static Pair<Integer, JSONArray> getRequestForJsonArray(URL url, List<Pair<String, String>> headers){
            headers.add(new Pair<>("Content-Type", "application/json;charset=UTF-8"));
            Pair<Integer, String> result = getRequest(url, headers);

            if (result.first.equals(HttpURLConnection.HTTP_OK)){
                try {
                    return new Pair<>(result.first, new JSONArray(result.second));
                } catch (JSONException e) {
                    e.printStackTrace();
                    return new Pair<>(461, new JSONArray());
                }
            }
            return new Pair<>(result.first, new JSONArray());
        }

        public static Pair<Integer, String> getRequestForString(URL url, List<Pair<String, String>> headers){

            Log.d("DEBUG", "5");

            headers.add(new Pair<>("Content-Type", "application/json;charset=UTF-8"));
            Pair<Integer, String> result = getRequest(url, headers);

            if (result.first.equals(HttpURLConnection.HTTP_OK)){

                Log.d("DEBUG", "6");

                return new Pair<>(result.first, result.second);
            }
            return new Pair<>(result.first, "");
        }

        public static void createToast(String message, Activity a) {
            LayoutInflater inflater = a.getLayoutInflater();
            View layout = inflater.inflate(R.layout.custom_toast, a.findViewById(R.id.custom_toast_container));

            TextView text = layout.findViewById(R.id.text);
            text.setText(message);

            Toast toast = new Toast(a.getApplicationContext());
            toast.setDuration(Toast.LENGTH_SHORT);
            toast.setView(layout);
            toast.show();
        }

        public static JSONObject getJsonObjectByIndex(JSONArray rows, int index){
            try {
                JSONObject jsonObject = rows.getJSONObject(index);
                Log.i("JSON", jsonObject.toString());
                return jsonObject;
            } catch (JSONException e) {
                Log.d("JSON", e.toString());
                return null;
            }
        }
}