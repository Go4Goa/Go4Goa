import { pointSchema, type Point } from '../../shared/model';
export const defaultMapPoint: Point = { lat: 15.483, lng: 73.817 };
// One-shot and opt-in. No private coordinates persisted in local storage.
export function locateInGoa(): Promise<Point> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error('Location is unavailable. Explore the map or search by area.')); return; }
    navigator.geolocation.getCurrentPosition(position => {
      const result = pointSchema.safeParse({ lat: position.coords.latitude, lng: position.coords.longitude });
      if (!result.success) reject(new Error('You’re outside Goa. Explore the map or search by area.'));
      else resolve(result.data);
    }, () => reject(new Error('Location could not be shared. Explore the map or search by area.')), {
      timeout: 12000, maximumAge: 60000, enableHighAccuracy: false,
    });
  });
}
