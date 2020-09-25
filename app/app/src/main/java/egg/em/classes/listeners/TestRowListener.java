package egg.em.classes.listeners;

import android.util.Pair;
import android.view.Gravity;
import android.view.View;
import android.widget.PopupWindow;

import egg.em.operations.GetPopupOperation;

import java.util.concurrent.ExecutionException;

public class TestRowListener implements View.OnClickListener {

    private int rowId;
    private View parent;

    public TestRowListener(int id, View fragment) {
        this.rowId = id;
        this.parent = fragment;
    }

    @Override
    public void onClick(View v) {
        try {
            PopupWindow popupWindow = new GetPopupOperation().execute(new Pair<>(rowId, v.getContext())).get();
            popupWindow.showAtLocation(parent, Gravity.CENTER, 0, 0);
//            popupWindow.update(0,0, ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        } catch (ExecutionException | InterruptedException e) {
            e.printStackTrace();
        }
    }
}
