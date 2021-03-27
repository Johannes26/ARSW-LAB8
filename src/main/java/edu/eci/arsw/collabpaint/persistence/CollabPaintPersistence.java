package edu.eci.arsw.collabpaint.persistence;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import edu.eci.arsw.collabpaint.model.Point;

@Service
public class CollabPaintPersistence implements ICollabPaintPersistence {

	ConcurrentHashMap<String, List<Point>> boards = new ConcurrentHashMap<>();

	@Override
	public List<Point> getPolygon(String numero, Point pt) throws CollabPaintException {
		if (boards.containsKey(numero)) {
			if (!(boards.get(numero).size() >= 3)) {
				throw new CollabPaintException("This Board, doesn't have more than 3 points");
			}
			return boards.get(numero);
		} else
			throw new CollabPaintException("Not found Board number " + numero);
	}

	@Override
	public void putPointBoard(String numero, Point pt) {
		if (!boards.containsKey(numero)) {
			List<Point> puntos = new ArrayList<Point>() {
				{
					add(pt);
				}
			};
			boards.put(numero, puntos);
		} else {
			boards.get(numero).add(pt);
		}
	}

}
