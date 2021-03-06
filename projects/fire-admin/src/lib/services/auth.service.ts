import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { first } from 'rxjs/operators';
import { auth } from 'firebase/app';
import { CurrentUserService } from './current-user.service';

@Injectable()
export class AuthService {

  firebaseUser: firebase.User = null;
  lastError: firebase.FirebaseError = null;

  constructor(private afa: AngularFireAuth, private currentUser: CurrentUserService) {
    this.afa.auth.onAuthStateChanged((user: firebase.User) => {
      // console.log(user);
      this.firebaseUser = user;
      this.currentUser.set(user);
    });
  }

  private _isSignedIn(): boolean {
    return !!this.firebaseUser;
  }

  private setLastError(error: firebase.FirebaseError): void {
    this.lastError = error;
    console.error(`[${error.code}] ${error.message}`);
  }

  isSignedIn(): Promise<firebase.User> {
    return this.afa.authState.pipe(first()).toPromise();
  }

  signIn(email: string, password: string, isPersistent: boolean = false): Promise<void> {
    // console.log('sign in', email, password);
    return new Promise((resolve, reject) => {
      if (this._isSignedIn()) {
        console.log('already signed in!');
        resolve();
      } else {
        // Sign in
        const persistence = isPersistent ? auth.Auth.Persistence.LOCAL : auth.Auth.Persistence.SESSION;
        this.afa.auth.setPersistence(persistence).then(() => {
          this.afa.auth.signInWithEmailAndPassword(email, password).then(() => {
            resolve();
          }).catch((error: firebase.FirebaseError) => {
            this.setLastError(error);
            reject(this.lastError);
          });
        }).catch((error: firebase.FirebaseError) => {
          this.setLastError(error);
          reject(this.lastError);
        });
      }
    });
  }

  signOut(force: boolean = false): Promise<void> {
    // console.log('sign out', this._isSignedIn());
    return new Promise((resolve, reject) => {
      if (force || this._isSignedIn()) {
        this.afa.auth.signOut().then(() => {
          resolve();
        }).catch((error: firebase.FirebaseError) => {
          this.setLastError(error);
          reject(this.lastError);
        });
      } else {
        resolve();
      }
    });
  }

}
