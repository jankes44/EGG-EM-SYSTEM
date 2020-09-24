package com.example.egg_em.activities.fragments;

import android.app.Activity;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TableLayout;
import android.widget.TableRow;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;

import com.example.egg_em.R;
import com.example.egg_em.operations.GenerateTableOperation;

import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.ExecutionException;

@RequiresApi(api = Build.VERSION_CODES.N)
public class TestHistoryFragment extends Fragment {


    TableLayout testsTable;
    String[] headers = new String[]{"ID", "Site", "Building", "Levels", "Devices", "Result", "Set", "Start Time"};

    Timer timer = new Timer();
    Activity activity;
    View inflate_;

    private final TimerTask refreshTable = new TimerTask() {
        @Override
        public void run() {
            activity.runOnUiThread(() -> {
                testsTable.removeAllViews();
                testsTable.addView(createHeader());
                try {
                    new GenerateTableOperation(inflate_).execute(getContext()).get().forEach(r -> testsTable.addView(r));
                } catch (ExecutionException | InterruptedException e) {
                    e.printStackTrace();
                }
            });
        }
    };

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View inflate = inflater.inflate(R.layout.test_history_fragment, container, false);

        testsTable = inflate.findViewById(R.id.test_table);
        testsTable.addView(createHeader());
        inflate_ = inflate;

        try {
            (new GenerateTableOperation(inflate).execute(getContext()).get()).forEach(r -> testsTable.addView(r));
        } catch (ExecutionException | InterruptedException e) {
            e.printStackTrace();
        }

        timer.schedule(refreshTable, 5 * 60 * 1000); // 5 minutes
        activity = getActivity();

        return inflate;
    }

    private TableRow createHeader(){
        TableRow tableHeader = new TableRow(getContext());
        for (String header : headers) {
            TextView t = (TextView) View.inflate(getContext(), R.layout.header_cell, null);
            t.setText(header);
            tableHeader.addView(t);
        }
        return tableHeader;
    }

}
