package egg.em.server;

import egg.em.server.entities.dbEntities.TestEntity;
import egg.em.server.entities.liveEntities.TestDevice;

import java.util.Set;

public final class LiveTest {

    private static LiveTest INSTANCE;

    private boolean inProgress;
    private Set<TestDevice> testDevices;
    private long testId;
    private String status;
    private long userId;
    private boolean cutAllClicked;
    private boolean abortClicked;
    private boolean finishClicked;
    private String type;

    private LiveTest() {
        this.inProgress = false;
    }

    public static LiveTest getInstance() {
        if (INSTANCE == null) {
            INSTANCE = new LiveTest();
        }

        return INSTANCE;
    }

    public void init(Set<TestDevice> testDevices, TestEntity testEntity, long userId){
        this.testId = testEntity.getId();
        this.userId = userId;
        this.status = testEntity.getResult();
        this.cutAllClicked = false;
        this.abortClicked = false;
        this.finishClicked = false;
        this.type = testEntity.getType();
        this.testDevices = testDevices;

    }

    public boolean isInProgress() {
        return inProgress;
    }

    public void setInProgress(boolean inProgress) {
        this.inProgress = inProgress;
    }
}
