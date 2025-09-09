import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:3000/Notification';
  

  constructor(private http: HttpClient) {}

  // Push a new notification
  pushNotification(notification: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, notification);
    
  }

  // Fetch notifications by role and optional userId
  // Fetch notifications by role and optional userId (newest first)
getNotifications(role: string, userId?: string): Observable<any[]> {
  let url = `${this.apiUrl}?role=${role}`;
  if (userId) url += `&userId=${userId}`;
  url += `&_sort=timestamp&_order=desc`;
  return this.http.get<any[]>(url);
}


  // Mark as read
  markAsRead(id: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, { read: true });
  }

  deleteNotification(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
