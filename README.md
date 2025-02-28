### 1. Planning and Requirement Analysis

---

## Objectives
Build an MVP for the golf match hosting app with the following core features:  
- **Match Hosting**: Create a match and invite friends.  
- **Deposits**: Players deposit money before the match starts.  
- **Gameplay**: Players input scores during the match.  
- **Payouts**: Winnings are distributed, and players can withdraw their money.  
- **Future features and enhancements will be added after the MVP is built.**  

---

## Tech Stack  
- **Frontend:** React Native with Expo
- **Backend:** Firebase (Real-time database syncing, Authentication, Cloud Functions)
- **Payment Integration:** Stripe for deposits and payouts.

---

## MVP Flow
1. **User Sign Up and Login**  
   - Firebase Authentication (Email, Google, and Apple Sign-In)  

2. **Match Start or Join:**  
   - Create or Join a match using QR code or code.
   - Unified account type for both country clubs and players.
   - "Start Round" button prompts "Match Type" only.

3. **Match Settings:**
   - Skins or No Skins
   - Skins Amount Per Hole
   - Match Type: Scramble or Standard

4. **Joining a Match:**
   - Prompt to deposit from wallet or pay into a pool using Stripe.
   - Profile picture gets a green ring once money is deposited.

5. **Gameplay:**
   - Digital scorecard based on the course.
   - Real-time score updates.

6. **End of Match:**
   - Skins are calculated and distributed.
   - Winnings are credited to the wallet.
   - Secure withdrawals via Apple Pay or Stripe.

---

### Data Architecture
**Database Schema Design:**
- Users Collection
- Matches Collection
- Scores Collection
- Wallet Transactions Collection

---

### Security Requirements
1. User Authentication and Authorization using Firebase Authentication.
2. Payment Security using Stripe's PCI DSS compliant system.
3. Data Privacy and Compliance

