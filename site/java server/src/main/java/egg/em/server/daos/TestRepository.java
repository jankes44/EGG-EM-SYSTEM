package egg.em.server.daos;

import egg.em.server.entities.dbEntities.TestEntity;
import org.springframework.data.repository.CrudRepository;

public interface TestRepository extends CrudRepository<TestEntity, Long> {

}
