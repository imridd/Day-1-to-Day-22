package Day_6.generics;
import java.util.*;
public class InMemoryRepository<T extends Identifiable<ID>, ID> {
    private List<T> list = new ArrayList<>();
    public void save(T obj) {
        list.add(obj);
    }
    public Optional<T> findById(ID id) {
        return list.stream().filter(obj -> obj.getId().equals(id)).findFirst();
    }
    public List<T> findAll() {
        return list;
    }
}