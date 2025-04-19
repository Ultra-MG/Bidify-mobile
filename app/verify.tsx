import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { auth } from '../firebaseConfig';
import { sendEmailVerification, reload } from 'firebase/auth';
import { router } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
export default function VerifyScreen() {
    
  const [emailSent, setEmailSent] = useState(true); // sent on register
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(false);
  const { fromRegister } = useLocalSearchParams();
  const [showMessage, setShowMessage] = useState(fromRegister === '1');
  const user = auth.currentUser;

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!user || user.emailVerified) {
        clearInterval(interval);
        return;
      }

      try {
        setChecking(true);
        await reload(user);
        if (user.emailVerified) {
          setVerified(true);
          setShowMessage(true);
          setTimeout(() => {
            if (auth.currentUser) {
              router.replace('/home');
            }            
          }, 2000);
          clearInterval(interval);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setChecking(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  const handleResend = async () => {
    try {
      if (user && !user.emailVerified) {
        await sendEmailVerification(user);
        setEmailSent(true);
        setShowMessage(true);
      }
    } catch (err: any) {
      setShowMessage(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Bidify</Text>
      <Text style={styles.title}>Verify your email</Text>
      <Text style={styles.subtitle}>A verification link was sent to:</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <Pressable style={styles.button} onPress={handleResend}>
        <Text style={styles.buttonText}>Resend Email</Text>
      </Pressable>

      {/* ✅ Custom Popup */}
      {showMessage && (
        <View style={styles.popup}>
          <Text style={styles.popupText}>
            {verified
              ? '✅ Your email is verified. Redirecting...'
              : '📨 Verification email sent. Please check your inbox.'}
          </Text>
          {!verified && (
            <Pressable onPress={() => setShowMessage(false)} style={styles.okButton}>
              <Text style={styles.okButtonText}>OK</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e10',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
  },
  email: {
    color: '#10a37f',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  button: {
    width: '100%',
    backgroundColor: '#10a37f',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  popup: {
    backgroundColor: '#1a1a1d',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    borderColor: '#10a37f',
    borderWidth: 1,
    alignItems: 'center',
  },
  popupText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  okButton: {
    backgroundColor: '#10a37f',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  okButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
