package egg.em.operations;

import android.content.Context;
import android.os.AsyncTask;
import android.os.Build;
import android.util.Log;
import android.util.Pair;
import android.view.View;
import android.view.ViewGroup;
import android.widget.PopupWindow;
import android.widget.TableLayout;
import android.widget.TableRow;
import android.widget.TextView;

import androidx.annotation.RequiresApi;

import egg.em.R;
import egg.em.classes.Utilities;
import egg.em.classes.singletons.LoggedUser;

import org.json.JSONArray;
import org.json.JSONObject;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Arrays;
import java.util.Locale;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class GetPopupOperation extends AsyncTask<Pair<Integer, Context>, Integer, PopupWindow> {

    private static final String URL = "http://63.32.97.125:5000/api/trialtests/lightsresponses/%d";
    private static final String[] headers = new String[]{"ID", "Type", "Location", "Response"};

    @RequiresApi(api = Build.VERSION_CODES.N)
    @Override
    protected PopupWindow doInBackground(Pair<Integer, Context>... params) {

        LoggedUser user = LoggedUser.getInstance(null);
        String completeUrl = String.format(Locale.ENGLISH, URL, params[0].first);

        java.net.URL url;
        try {
            url = new URL(completeUrl);
        } catch (MalformedURLException e) {
            Log.e("EXCEPTION", e.toString());
            return null;
        }

        Pair<Integer, JSONArray> result = Utilities.getRequestForJsonArray(url, user.createAuthHeader());
        if (result.first.equals(200)) {

            Context context = params[0].second;
            View parentView = View.inflate(context, R.layout.test_history_popup, null);

            int backgroundColor = parentView.getResources().getColor(R.color.grey_transparent);
            parentView.setBackgroundColor(backgroundColor);

            TableLayout table = parentView.findViewById(R.id.popup_table);

            TextView popupTitle = parentView.findViewById(R.id.popup_title);
            popupTitle.setText(String.format(Locale.ENGLISH,"Details for test %d", params[0].first));

            table.addView(createHeader(context));
            JSONArray rows = result.second;
            IntStream.range(0, rows.length()).parallel()
                    .mapToObj(index -> Utilities.getJsonObjectByIndex(rows, index))
                    .map(o -> o != null ? parseRow(o, context) : null)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList())
                    .forEach(table::addView);


            return new PopupWindow(parentView, ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT, true);
        }

        Log.d("TEST", "3");
        return new PopupWindow();
    }

    @RequiresApi(api = Build.VERSION_CODES.M)
    private TableRow createHeader(Context context){
        TableRow tableHeader = new TableRow(context);
        for (String header : headers) {
            TextView t = (TextView) View.inflate(context, R.layout.popup_header_cell, null);
            t.setText(header);
            tableHeader.addView(t);
        }
        return tableHeader;
    }

    @RequiresApi(api = Build.VERSION_CODES.N)
    private TableRow parseRow(JSONObject o, Context context) {
        TableRow row = new TableRow(context);
        Arrays.stream(new String[]{"device_id", "type", "building", "result"})
                .map(String::toLowerCase)
                .map(name -> new Pair<>(o.optString(name), name))
                .map(v -> {
                    TextView tv = (TextView) View.inflate(context, R.layout.transparent_cell, null);
                    String text;
                    if (v.second.equals("building")){
                        text = String.format("%s - %s level", v.first, o.optString("level"));
                    }
                    else {
                        text = v.first.equals("null") ? "" : v.first;
                    }
                    tv.setText(text);
                    return tv;
                }).forEach(row::addView);
        return row;
    }
}
