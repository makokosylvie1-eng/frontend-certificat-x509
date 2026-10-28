import { Component, ChangeDetectorRef, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CertificatService } from './services/certificat.service';
import { AuthService } from './services/auth.service';

type Page = 'home' | 'login' | 'register' | 'analyzer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [CertificatService],
  template: `
    <!-- Icône œil (réutilisée pour tous les champs mot de passe) -->
    <ng-template #eyeIcon let-visible>
      <svg *ngIf="!visible" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <svg *ngIf="visible" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
      </svg>
    </ng-template>

    <!-- ================= PAGE D'ACCUEIL ================= -->
    <div *ngIf="currentPage === 'home'" class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center px-4">
      <div class="max-w-xl w-full bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl text-white text-center border border-white/15">
        <h1 class="text-3xl font-extrabold mb-4 tracking-tight">Plateforme de Cryptographie X.509</h1>

        <p class="text-slate-300 text-sm mb-8 leading-relaxed">
          Bienvenue sur l'outil de diagnostic X.509 (Master 1 Informatique - Groupe 09).
        </p>

        <div *ngIf="auth.isLoggedIn" class="text-sm text-slate-200 mb-4">
          Connecté en tant que <strong>{{ auth.user?.name }}</strong>
        </div>

        <button
          type="button"
          (click)="goToLab()"
          class="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 group">
          <span>{{ auth.isLoggedIn ? "Accéder au Laboratoire d'Analyse" : "Se connecter pour accéder au Laboratoire" }}</span>
          <span class="text-lg transition-transform group-hover:translate-x-1">→</span>
        </button>

        <button
          *ngIf="!auth.isLoggedIn"
          type="button"
          (click)="navigateTo('register')"
          class="w-full mt-3 bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-2xl border border-white/20 transition cursor-pointer text-sm">
          Créer un compte
        </button>
      </div>
    </div>

    <!-- ================= PAGE CONNEXION ================= -->
    <div *ngIf="currentPage === 'login'" class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center px-4 py-10">
      <div class="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">

        <div class="px-8 pt-7 pb-6 border-b border-slate-100">
          <button type="button" (click)="navigateTo('home')"
            class="text-sm text-blue-600 hover:text-blue-800 font-semibold cursor-pointer">← Retour à l'accueil</button>
          <div class="flex items-center gap-3 mt-5">
            <span class="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </span>
            <div>
              <h2 class="text-xl font-bold text-slate-900 leading-tight">Connexion</h2>
              <p class="text-sm text-slate-500">Accédez au laboratoire X.509</p>
            </div>
          </div>
        </div>

        <div class="px-8 py-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5" for="login-email">Adresse e-mail</label>
            <input id="login-email" type="email" autocomplete="email" placeholder="nom@exemple.com"
              [(ngModel)]="loginForm.email" (keydown.enter)="onLogin()"
              [class]="inputCls('email')" />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5" for="login-password">Mot de passe</label>
            <div class="relative">
              <input id="login-password" [type]="showLoginPw ? 'text' : 'password'" autocomplete="current-password"
                [(ngModel)]="loginForm.password" (keydown.enter)="onLogin()"
                [class]="inputCls('password', 'pr-12')" />
              <button type="button" (click)="showLoginPw = !showLoginPw"
                [attr.aria-label]="showLoginPw ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
                class="absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500 hover:text-slate-800 cursor-pointer">
                <ng-container *ngTemplateOutlet="eyeIcon; context: { $implicit: showLoginPw }"></ng-container>
              </button>
            </div>
          </div>

          <button type="button" (click)="onLogin()" [disabled]="authLoading"
            class="w-full mt-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl shadow-md transition cursor-pointer">
            {{ authLoading ? 'Connexion en cours...' : 'Se connecter' }}
          </button>
        </div>

        <div class="px-8 py-4 bg-slate-50 border-t border-slate-100 text-sm text-slate-600 text-center">
          Pas encore de compte ?
          <button type="button" (click)="navigateTo('register')" class="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer">Créer un compte</button>
        </div>
      </div>
    </div>

    <!-- ================= PAGE INSCRIPTION ================= -->
    <div *ngIf="currentPage === 'register'" class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center px-4 py-10">
      <div class="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">

        <div class="px-8 pt-7 pb-6 border-b border-slate-100">
          <button type="button" (click)="navigateTo('home')"
            class="text-sm text-blue-600 hover:text-blue-800 font-semibold cursor-pointer">← Retour à l'accueil</button>
          <div class="flex items-center gap-3 mt-5">
            <span class="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
            </span>
            <div>
              <h2 class="text-xl font-bold text-slate-900 leading-tight">Créer un compte</h2>
              <p class="text-sm text-slate-500">Votre nom s'affichera dans le laboratoire</p>
            </div>
          </div>
        </div>

        <div class="px-8 py-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5" for="reg-name">Nom complet</label>
            <input id="reg-name" type="text" autocomplete="name" placeholder="Prénom Nom"
              [(ngModel)]="registerForm.name" [class]="inputCls('name')" />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5" for="reg-email">Adresse e-mail</label>
            <input id="reg-email" type="email" autocomplete="email" placeholder="nom@exemple.com"
              [(ngModel)]="registerForm.email" [class]="inputCls('email')" />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5" for="reg-password">Mot de passe</label>
            <div class="relative">
              <input id="reg-password" [type]="showRegPw ? 'text' : 'password'" autocomplete="new-password"
                [(ngModel)]="registerForm.password" [class]="inputCls('password', 'pr-12')" />
              <button type="button" (click)="showRegPw = !showRegPw"
                [attr.aria-label]="showRegPw ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
                class="absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500 hover:text-slate-800 cursor-pointer">
                <ng-container *ngTemplateOutlet="eyeIcon; context: { $implicit: showRegPw }"></ng-container>
              </button>
            </div>
            <p class="text-xs text-slate-500 mt-1.5">8 caractères minimum, avec des lettres et des chiffres.</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5" for="reg-password2">Confirmer le mot de passe</label>
            <div class="relative">
              <input id="reg-password2" [type]="showRegPw ? 'text' : 'password'" autocomplete="new-password"
                [(ngModel)]="registerForm.password_confirmation" (keydown.enter)="onRegister()"
                [class]="inputCls('password_confirmation', 'pr-12')" />
              <button type="button" (click)="showRegPw = !showRegPw"
                [attr.aria-label]="showRegPw ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
                class="absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500 hover:text-slate-800 cursor-pointer">
                <ng-container *ngTemplateOutlet="eyeIcon; context: { $implicit: showRegPw }"></ng-container>
              </button>
            </div>
          </div>

          <button type="button" (click)="onRegister()" [disabled]="authLoading"
            class="w-full mt-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl shadow-md transition cursor-pointer">
            {{ authLoading ? 'Création du compte...' : 'Créer mon compte' }}
          </button>
          <p class="text-xs text-slate-500 text-center">Utilisez uniquement des données fictives.</p>
        </div>

        <div class="px-8 py-4 bg-slate-50 border-t border-slate-100 text-sm text-slate-600 text-center">
          Déjà inscrit ?
          <button type="button" (click)="navigateTo('login')" class="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer">Se connecter</button>
        </div>
      </div>
    </div>

    <!-- ================= PAGE DE L'OUTIL (LABORATOIRE) ================= -->
    <div *ngIf="currentPage === 'analyzer'" class="min-h-screen bg-slate-100 py-10 px-4">
      <div class="max-w-3xl mx-auto">

        <div class="flex items-center justify-between mb-6">
          <button type="button" (click)="navigateTo('home')"
            class="text-sm text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1.5 cursor-pointer group">
            <span class="transition-transform group-hover:-translate-x-1">←</span> Accueil
          </button>

          <div class="flex items-center gap-3">
            <span class="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">{{ initial }}</span>
            <span class="text-sm text-slate-700 hidden sm:inline">Bonjour, <strong>{{ auth.user?.name }}</strong></span>
            <button type="button" (click)="onLogout()"
              class="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-600 hover:bg-slate-50 cursor-pointer transition">
              Se déconnecter
            </button>
          </div>
        </div>

        <div class="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div class="px-6 sm:px-8 py-6 border-b border-slate-100 flex items-start gap-4">
            <span class="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </span>
            <div>
              <h2 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Laboratoire de validation X.509</h2>
              <p class="text-sm text-slate-500 mt-1">Collez un certificat au format PEM, ou insérez l'exemple, puis lancez l'analyse.</p>
            </div>
          </div>

          <div class="px-6 sm:px-8 py-6">
            <div class="rounded-2xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-blue-600 transition">
              <div class="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
                <span class="font-medium text-slate-600">Certificat au format PEM</span>
                <span class="flex items-center gap-3">
                  <span>{{ certificatePem.length }} caractères</span>
                  <button type="button" (click)="certificatePem = ''" [disabled]="!certificatePem"
                    class="text-blue-600 hover:text-blue-800 disabled:text-slate-300 disabled:cursor-not-allowed cursor-pointer font-medium">Effacer</button>
                </span>
              </div>
              <textarea
                [(ngModel)]="certificatePem"
                rows="9"
                spellcheck="false"
                class="w-full p-4 font-mono text-xs bg-white outline-none resize-y text-slate-800"
                placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"></textarea>
            </div>

            <div class="flex flex-col sm:flex-row gap-3 mt-5">
              <button type="button" (click)="loadSample()"
                class="bg-white hover:bg-slate-50 text-slate-700 font-medium px-5 py-3.5 rounded-xl transition cursor-pointer text-sm border border-slate-300">
                Insérer un exemple
              </button>
              <button type="button" (click)="onValidate()" [disabled]="loading"
                class="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-xl shadow-md transition cursor-pointer">
                {{ loading ? 'Analyse en cours...' : 'Analyser et valider' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= MODALE DE RÉSULTAT ================= -->
    <div *ngIf="result && view" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" (click)="closeModal()">
      <div class="bg-white w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden"
        role="dialog" aria-modal="true" aria-labelledby="res-title" (click)="$event.stopPropagation()">

        <!-- Verdict -->
        <div class="px-6 py-5 border-b" [ngClass]="tones[view.verdict.tone].box">
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-start gap-3">
              <span class="mt-1.5 w-3 h-3 rounded-full shrink-0" [ngClass]="tones[view.verdict.tone].dot"></span>
              <div>
                <h3 id="res-title" class="font-bold text-lg leading-tight">{{ view.verdict.title }}</h3>
                <p class="text-sm mt-1">{{ view.verdict.text }}</p>
              </div>
            </div>
            <button type="button" (click)="closeModal()" aria-label="Fermer"
              class="text-xl leading-none px-2 py-1 opacity-60 hover:opacity-100 cursor-pointer">✕</button>
          </div>
          <p class="text-xs mt-3 opacity-80">
            Analyse demandée par <strong>{{ auth.user?.name }}</strong> le {{ analyzedAt | date:'dd/MM/yyyy à HH:mm' }}
          </p>
        </div>

        <!-- Contenu -->
        <div class="flex-1 overflow-y-auto p-6 space-y-5 text-sm text-slate-700">

          <!-- Sujet et émetteur -->
          <div class="grid sm:grid-cols-2 gap-4">
            <section class="rounded-2xl border border-slate-200 p-4">
              <h4 class="text-sm font-semibold text-slate-900 mb-3">Sujet</h4>
              <dl class="space-y-2">
                <div *ngFor="let p of view.subject">
                  <dt class="text-xs text-slate-500">{{ p.label }}</dt>
                  <dd class="break-words text-slate-900">{{ p.v }}</dd>
                </div>
              </dl>
            </section>
            <section class="rounded-2xl border border-slate-200 p-4">
              <h4 class="text-sm font-semibold text-slate-900 mb-3">Émetteur</h4>
              <dl class="space-y-2">
                <div *ngFor="let p of view.issuer">
                  <dt class="text-xs text-slate-500">{{ p.label }}</dt>
                  <dd class="break-words text-slate-900">{{ p.v }}</dd>
                </div>
              </dl>
            </section>
          </div>

          <!-- Validité -->
          <section class="rounded-2xl border border-slate-200 p-4">
            <div class="flex items-center justify-between gap-3 mb-3">
              <h4 class="text-sm font-semibold text-slate-900">Période de validité</h4>
              <span *ngIf="result.validity_status" class="text-xs font-medium px-2.5 py-1 rounded-full" [ngClass]="tones[view.validityTone].badge">
                {{ result.validity_status }}
              </span>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-xl bg-slate-50 p-3">
                <p class="text-xs text-slate-500">Début</p>
                <p class="font-mono text-xs text-slate-900 mt-0.5">{{ result.validFrom }}</p>
              </div>
              <div class="rounded-xl bg-slate-50 p-3">
                <p class="text-xs text-slate-500">Fin</p>
                <p class="font-mono text-xs text-slate-900 mt-0.5">{{ result.validTo }}</p>
              </div>
            </div>
          </section>

          <!-- Technique -->
          <section class="rounded-2xl border border-slate-200 p-4">
            <h4 class="text-sm font-semibold text-slate-900 mb-3">Caractéristiques techniques</h4>
            <div class="grid sm:grid-cols-2 gap-3">
              <div class="rounded-xl bg-slate-50 p-3" *ngIf="result.key_info">
                <p class="text-xs text-slate-500">Clé publique</p>
                <p class="text-slate-900 mt-0.5">{{ result.key_info }}</p>
              </div>
              <div class="rounded-xl bg-slate-50 p-3" *ngIf="result.signature_algorithm">
                <p class="text-xs text-slate-500">Algorithme de signature</p>
                <p class="text-slate-900 mt-0.5">{{ result.signature_algorithm }}</p>
              </div>
              <div class="rounded-xl bg-slate-50 p-3 sm:col-span-2">
                <p class="text-xs text-slate-500">Numéro de série</p>
                <p class="font-mono text-xs text-slate-900 mt-0.5 break-all">{{ result.serialNumber }}</p>
              </div>
            </div>
          </section>

          <!-- Empreintes -->
          <section class="rounded-2xl border border-slate-200 p-4">
            <h4 class="text-sm font-semibold text-slate-900 mb-3">Empreintes</h4>
            <div class="space-y-3">
              <div class="rounded-xl bg-slate-50 p-3">
                <div class="flex items-center justify-between mb-1">
                  <p class="text-xs text-slate-500">SHA-256</p>
                  <button type="button" (click)="copy('sha256', result.fingerprints?.sha256)"
                    class="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer">
                    {{ copiedKey === 'sha256' ? 'Copié' : 'Copier' }}
                  </button>
                </div>
                <p class="font-mono text-xs text-slate-900 break-all">{{ result.fingerprints?.sha256 }}</p>
              </div>
              <div class="rounded-xl bg-slate-50 p-3">
                <div class="flex items-center justify-between mb-1">
                  <p class="text-xs text-slate-500">SHA-1</p>
                  <button type="button" (click)="copy('sha1', result.fingerprints?.sha1 || result.fingerprints?.shal)"
                    class="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer">
                    {{ copiedKey === 'sha1' ? 'Copié' : 'Copier' }}
                  </button>
                </div>
                <p class="font-mono text-xs text-slate-900 break-all">{{ result.fingerprints?.sha1 || result.fingerprints?.shal }}</p>
              </div>
            </div>
          </section>

          <!-- Révocation -->
          <section class="rounded-2xl border border-slate-200 p-4">
            <h4 class="text-sm font-semibold text-slate-900 mb-3">Révocation (simulée)</h4>
            <div class="space-y-3">
              <div class="flex items-start gap-3">
                <span class="mt-1.5 w-2.5 h-2.5 rounded-full shrink-0" [ngClass]="tones[view.crlTone].dot"></span>
                <div><p class="text-xs text-slate-500">CRL</p><p class="text-slate-900">{{ result.crl_status }}</p></div>
              </div>
              <div class="flex items-start gap-3">
                <span class="mt-1.5 w-2.5 h-2.5 rounded-full shrink-0" [ngClass]="tones[view.ocspTone].dot"></span>
                <div><p class="text-xs text-slate-500">OCSP</p><p class="text-slate-900">{{ result.ocsp_status }}</p></div>
              </div>
            </div>
          </section>

          <!-- Diagnostic TLS -->
          <section class="rounded-2xl border border-slate-200 p-4">
            <h4 class="text-sm font-semibold text-slate-900 mb-3">Diagnostic TLS</h4>
            <ul class="space-y-2">
              <li *ngFor="let t of view.tlsItems" class="flex items-start gap-3">
                <span class="mt-1.5 w-2.5 h-2.5 rounded-full shrink-0" [ngClass]="tones[t.tone].dot"></span>
                <span class="text-slate-900">{{ t.text }}</span>
              </li>
            </ul>
          </section>
        </div>

        <div class="px-6 py-4 border-t border-slate-100 bg-white">
          <button type="button" (click)="closeModal()"
            class="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition cursor-pointer text-sm">
            Fermer
          </button>
        </div>
      </div>
    </div>

    <!-- ================= BOÎTE DE DIALOGUE D'ERREUR ================= -->
    <div *ngIf="dialog" class="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" (click)="closeDialog()">
      <div class="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center"
        role="alertdialog" aria-modal="true" aria-labelledby="dlg-title" (click)="$event.stopPropagation()">
        <div class="mx-auto mb-4 w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h3 id="dlg-title" class="text-lg font-bold text-slate-900">{{ dialog.title }}</h3>
        <ul class="mt-3 space-y-1.5 text-sm text-slate-600">
          <li *ngFor="let m of dialog.messages">{{ m }}</li>
        </ul>
        <button type="button" (click)="closeDialog()"
          class="mt-6 w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition cursor-pointer text-sm">
          Compris
        </button>
      </div>
    </div>
  `
})
export class AppComponent {
  currentPage: Page = 'home';

  // --- Laboratoire ---
  certificatePem = '';
  result: any = null;
  view: any = null;
  analyzedAt = new Date();
  loading = false;
  copiedKey: string | null = null;

  // --- Authentification ---
  loginForm = { email: '', password: '' };
  registerForm = { name: '', email: '', password: '', password_confirmation: '' };
  fieldErrors: Record<string, string[]> = {};
  authLoading = false;
  showLoginPw = false;
  showRegPw = false;

  // --- Boîte de dialogue d'erreur ---
  dialog: { title: string; messages: string[] } | null = null;

  // --- Styles ---
  readonly tones: Record<string, { box: string; dot: string; badge: string }> = {
    green: { box: 'bg-emerald-50 border-emerald-200 text-emerald-900', dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-800' },
    amber: { box: 'bg-amber-50 border-amber-200 text-amber-900', dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-800' },
    red:   { box: 'bg-red-50 border-red-200 text-red-900', dot: 'bg-red-500', badge: 'bg-red-100 text-red-800' },
    slate: { box: 'bg-slate-50 border-slate-200 text-slate-900', dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-700' }
  };

  private readonly inputBase =
    'w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:bg-white focus:ring-2';
  private readonly inputOk = 'border-slate-200 focus:ring-blue-600 focus:border-blue-600';
  private readonly inputErr = 'border-red-400 bg-red-50/40 focus:ring-red-500 focus:border-red-500';

  private readonly dnLabels: Record<string, string> = {
    CN: 'Nom (CN)', O: 'Organisation (O)', OU: 'Unité (OU)', C: 'Pays (C)',
    L: 'Ville (L)', ST: 'Région (ST)', emailAddress: 'E-mail'
  };

  auth = inject(AuthService);
  private certService = inject(CertificatService);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    // Après un rechargement de page, on récupère le nom de l'utilisateur grâce au jeton gardé.
    if (this.auth.token) {
      this.auth.fetchMe().subscribe({
        next: () => this.cdr.detectChanges(),
        error: () => {
          this.auth.clear();
          this.cdr.detectChanges();
        }
      });
    }
  }

  get initial(): string {
    return (this.auth.user?.name ?? '?').trim().charAt(0).toUpperCase();
  }

  // Touche Échap : ferme la boîte de dialogue, sinon le résultat.
  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.dialog) {
      this.closeDialog();
    } else if (this.result) {
      this.closeModal();
    }
  }

  // ---------- Aides d'affichage ----------
  hasErr(field: string): boolean {
    return !!this.fieldErrors[field]?.length;
  }

  inputCls(field: string, extra = ''): string {
    return `${this.inputBase} ${this.hasErr(field) ? this.inputErr : this.inputOk} ${extra}`.trim();
  }

  openError(title: string, messages: string | string[]) {
    this.dialog = { title, messages: Array.isArray(messages) ? messages : [messages] };
    this.cdr.detectChanges();
  }

  closeDialog() {
    this.dialog = null;
    this.cdr.detectChanges();
  }

  // ---------- Navigation ----------
  navigateTo(page: Page) {
    // Le laboratoire est réservé aux utilisateurs connectés.
    if (page === 'analyzer' && !this.auth.isLoggedIn) {
      page = 'login';
    }
    this.fieldErrors = {};
    this.dialog = null;
    this.showLoginPw = false;
    this.showRegPw = false;
    this.currentPage = page;
    this.cdr.detectChanges();
  }

  goToLab() {
    this.navigateTo(this.auth.isLoggedIn ? 'analyzer' : 'login');
  }

  // ---------- Inscription ----------
  onRegister() {
    const f = this.registerForm;
    const errs: Record<string, string[]> = {};

    if (!f.name.trim()) {
      errs['name'] = ['Le nom complet est obligatoire.'];
    }
    if (!f.email.trim()) {
      errs['email'] = ["L'adresse e-mail est obligatoire."];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) {
      errs['email'] = ["L'adresse e-mail n'est pas valide."];
    }
    if (f.password.length < 8) {
      errs['password'] = ['Le mot de passe doit contenir au moins 8 caractères.'];
    } else if (!/[A-Za-z]/.test(f.password) || !/\d/.test(f.password)) {
      errs['password'] = ['Le mot de passe doit contenir des lettres et des chiffres.'];
    }
    if (f.password !== f.password_confirmation) {
      errs['password_confirmation'] = ['Les deux mots de passe ne sont pas identiques.'];
    }

    this.fieldErrors = errs;
    if (Object.keys(errs).length) {
      this.openError('Formulaire incomplet', Object.values(errs).flat());
      return;
    }

    this.authLoading = true;
    this.auth.register({ ...f, name: f.name.trim(), email: f.email.trim() }).subscribe({
      next: () => {
        this.authLoading = false;
        this.registerForm = { name: '', email: '', password: '', password_confirmation: '' };
        this.showRegPw = false;
        this.currentPage = 'analyzer';
        this.cdr.detectChanges();
      },
      error: (err) => this.handleAuthError(err, 'Inscription impossible')
    });
  }

  // ---------- Connexion ----------
  onLogin() {
    const errs: Record<string, string[]> = {};
    if (!this.loginForm.email.trim()) {
      errs['email'] = ["L'adresse e-mail est obligatoire."];
    }
    if (!this.loginForm.password) {
      errs['password'] = ['Le mot de passe est obligatoire.'];
    }

    this.fieldErrors = errs;
    if (Object.keys(errs).length) {
      this.openError('Formulaire incomplet', Object.values(errs).flat());
      return;
    }

    this.authLoading = true;
    this.auth.login(this.loginForm.email.trim(), this.loginForm.password).subscribe({
      next: () => {
        this.authLoading = false;
        this.loginForm = { email: '', password: '' };
        this.showLoginPw = false;
        this.currentPage = 'analyzer';
        this.cdr.detectChanges();
      },
      error: (err) => this.handleAuthError(err, 'Connexion impossible')
    });
  }

  onLogout() {
    const done = () => {
      this.auth.clear();
      this.certificatePem = '';
      this.result = null;
      this.view = null;
      this.currentPage = 'home';
      this.cdr.detectChanges();
    };
    // Même si le serveur ne répond pas, on ferme la session côté navigateur.
    this.auth.logout().subscribe({ next: done, error: done });
  }

  private handleAuthError(err: HttpErrorResponse, title: string) {
    this.authLoading = false;

    if (err.status === 422) {
      this.fieldErrors = err.error?.errors ?? {};
      const msgs = Object.values(this.fieldErrors).flat();
      this.openError(title, msgs.length ? msgs : [err.error?.message ?? 'Données invalides.']);
    } else if (err.status === 429) {
      this.openError('Trop de tentatives', 'Réessayez dans une minute.');
    } else if (err.status === 0) {
      this.openError('Serveur injoignable', 'Vérifiez que le backend tourne (php artisan serve).');
    } else {
      this.openError(title, 'Une erreur est survenue. Réessayez plus tard.');
    }
  }

  // ---------- Laboratoire ----------
  closeModal() {
    this.result = null;
    this.view = null;
    this.cdr.detectChanges();
  }

  copy(key: string, value: string) {
    if (!value || typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }
    navigator.clipboard.writeText(value).then(() => {
      this.copiedKey = key;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.copiedKey = null;
        this.cdr.detectChanges();
      }, 1500);
    });
  }

  // Certificat X.509 de démonstration, signé par une autorité de test (aucune donnée réelle).
  loadSample() {
    const lines = [
      '-----BEGIN CERTIFICATE-----',
      'MIIEADCCAuigAwIBAgIUbAtaGSMQQLv2vjgU3yCD3oU9Q2owDQYJKoZIhvcNAQEL',
      'BQAwPDEcMBoGA1UEAwwTVU5JS0lOIERlbW8gUm9vdCBDQTEPMA0GA1UECgwGVU5J',
      'S0lOMQswCQYDVQQGEwJDRDAeFw0yNjEwMjgwOTEwMDNaFw0yNzEwMjgwOTEwMDNa',
      'MEMxGTAXBgNVBAMMEGRlbW8udW5pa2luLnRlc3QxGTAXBgNVBAoMEFVOSUtJTiBH',
      'cm91cGUgMDkxCzAJBgNVBAYTAkNEMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB',
      'CgKCAQEAvPOB+mNL4FIJKP6b5mepM69Pxxa87aHz+/klWs/P+24oycTNIndgNVet',
      'Y7OfN4rTpYnzn1PRmAiDZZnbMbQX6VxTO44RSdjGXjhLG01KPsM3lusIA40Q/rs5',
      'lKcJ8RH7GRqZhULI2aeMaOwUcUM6q2Nw8SbnlGVEak1qQu3nZgilR42JdgBRbvAg',
      'sooyMqnjIdKORxINtKdlUmraVGZsCpGB9Bye5fzu5AMPmodyd+3NE2gCol+F7u4l',
      'bnA1KYtH1q2UpOF+yDO/n3WegTZofzASQ4QAwJw3X4qd5mhLGGkmROY/WJKyiMxK',
      'xnNVC9kChYqPhzBd53Zz93Q3JC+F1wIDAQABo4HyMIHvMAkGA1UdEwQCMAAwCwYD',
      'VR0PBAQDAgWgMBMGA1UdJQQMMAoGCCsGAQUFBwMBMBsGA1UdEQQUMBKCEGRlbW8u',
      'dW5pa2luLnRlc3QwLgYDVR0fBCcwJTAjoCGgH4YdaHR0cDovL2NybC51bmlraW4u',
      'dGVzdC9jYS5jcmwwMwYIKwYBBQUHAQEEJzAlMCMGCCsGAQUFBzABhhdodHRwOi8v',
      'b2NzcC51bmlraW4udGVzdDAdBgNVHQ4EFgQU0fPJ5RbEaTNZFOF3TmZI8jmHMN4w',
      'HwYDVR0jBBgwFoAUa6o5idoVF3vdxaSCarwyhYO+YyowDQYJKoZIhvcNAQELBQAD',
      'ggEBACQSJuSKC+SY3pNqfuIof7/wm7pcGwgDMk/vNKwdKOWuVlqXUZhQndGfDdmk',
      'bvitHZBN8zU4V4HfBz/Jw38Xx/TgXeRrkxepKiVUIz9QYWN7bcMYA8MMxfeF8aDl',
      '6qWiD7hkhjCmALXhK30vRShdR5HYJtkSD2aQ+wicRPS5gkwOwmIlhDCiklzMhPeo',
      'r/T08dzHS8Gwj2OaWnnjvIa1SBTtH51GKfXmPd9UcLGm56Ffdc3PMLrvrx0MJMDu',
      'v0qENRQV0UQfW+NjX+OyCr05Un3vw6UZBXqnYmYyCqylK5thivkENldA1JKUb5SN',
      'G4hWwpESyUHvQ3Oy3GvksWMCT64=',
      '-----END CERTIFICATE-----'
    ];
    this.certificatePem = lines.join('\n');
    this.cdr.detectChanges();
  }

  onValidate() {
    this.result = null;
    this.view = null;

    const trimmed = this.certificatePem.trim();
    if (!trimmed) {
      this.openError('Certificat manquant', 'Collez un certificat PEM, ou cliquez sur « Insérer un exemple ».');
      return;
    }
    if (!trimmed.includes('-----BEGIN CERTIFICATE-----') || !trimmed.includes('-----END CERTIFICATE-----')) {
      this.openError('Format invalide', 'Le certificat doit commencer par -----BEGIN CERTIFICATE----- et se terminer par -----END CERTIFICATE-----.');
      return;
    }

    this.loading = true;

    this.certService.parseCertificate(trimmed).subscribe({
      next: (response) => {
        this.loading = false;
        if (response && response.success && response.data) {
          this.result = response.data;
          this.view = this.buildView(response.data);
          this.analyzedAt = new Date();
          this.cdr.detectChanges();
        } else {
          this.openError('Réponse inattendue', "L'API a renvoyé un format que l'application ne comprend pas.");
        }
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;

        if (err.status === 401) {
          // Jeton expiré ou invalide : retour à la connexion.
          this.auth.clear();
          this.currentPage = 'login';
          this.openError('Session expirée', 'Reconnectez-vous pour continuer.');
        } else if (err.status === 0) {
          this.openError('Serveur injoignable', 'Vérifiez que le backend tourne (php artisan serve).');
        } else if (err.status === 429) {
          this.openError('Trop de requêtes', 'Patientez une minute avant de relancer une analyse.');
        } else {
          this.openError('Analyse impossible', err.error?.message ?? "L'analyse a échoué. Vérifiez le certificat et réessayez.");
        }
      }
    });
  }

  // ---------- Préparation de l'affichage du résultat ----------
  private buildView(d: any) {
    const validity = String(d.validity_status ?? '');
    const crl = String(d.crl_status ?? '');
    const ocsp = String(d.ocsp_status ?? '');

    const validityTone = !validity ? 'slate'
      : validity.startsWith('Valide') ? 'green'
      : validity.startsWith('Pas encore') ? 'amber'
      : 'red';

    const crlTone = crl.startsWith('Révoqué') ? 'red' : /impossible/i.test(crl) ? 'amber' : 'green';
    const ocspTone = /revoked/i.test(ocsp) ? 'red' : /impossible/i.test(ocsp) ? 'amber' : 'green';

    const tlsItems = String(d.tls_diagnostic ?? '')
      .split(' ; ')
      .filter(Boolean)
      .map((text) => ({
        text,
        tone: text.startsWith('Aucun problème') ? 'green'
          : /expiré|pas encore|trop courte|faible/i.test(text) ? 'red'
          : 'amber'
      }));

    const isRed = validityTone === 'red' || crlTone === 'red' || ocspTone === 'red'
      || tlsItems.some((t) => t.tone === 'red') || validity.startsWith('Pas encore');
    const isAmber = crlTone === 'amber' || ocspTone === 'amber' || tlsItems.some((t) => t.tone === 'amber');

    const verdict = isRed
      ? { tone: 'red', title: 'Certificat à rejeter', text: 'Un problème bloquant a été détecté : voir les détails ci-dessous.' }
      : isAmber
        ? { tone: 'amber', title: 'Certificat lisible, avec des réserves', text: 'Le certificat est analysable mais présente des points d\'attention.' }
        : { tone: 'green', title: 'Certificat conforme', text: 'Aucun problème détecté sur ce certificat.' };

    return {
      verdict,
      validityTone,
      crlTone,
      ocspTone,
      tlsItems,
      subject: this.parseDn(d.subject),
      issuer: this.parseDn(d.issuer)
    };
  }

  // Transforme "CN=..., O=..., C=..." en une liste lisible.
  private parseDn(dn: string): { label: string; v: string }[] {
    return String(dn ?? '')
      .split(/,\s*(?=[A-Za-z.]+=)/)
      .filter(Boolean)
      .map((part) => {
        const i = part.indexOf('=');
        if (i <= 0) {
          return { label: 'Valeur', v: part };
        }
        const key = part.slice(0, i).trim();
        return { label: this.dnLabels[key] ?? key, v: part.slice(i + 1).trim() };
      });
  }
}

export { AppComponent as App };