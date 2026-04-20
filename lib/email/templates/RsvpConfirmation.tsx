import {
  Html, Head, Preview, Body, Container,
  Section, Heading, Text, Hr, Link,
} from '@react-email/components'

interface Props {
  guestName:     string
  eventTitle:    string
  eventDate:     string
  eventTime:     string
  eventLocation: string
  eventUrl:      string
}

export function RsvpConfirmation({
  guestName,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  eventUrl,
}: Props) {
  return (
    <Html lang="en">
      <Head />
      <Preview>You&apos;re going to {eventTitle} 🎉</Preview>
      <Body style={{ backgroundColor: '#FDFBF7', fontFamily: 'Georgia, serif', margin: 0 }}>
        <Container style={{ maxWidth: 560, margin: '48px auto', padding: '0 24px' }}>

          <Heading style={{ fontSize: 32, fontWeight: 300, color: '#1a1a1a', marginBottom: 8 }}>
            You&apos;re in. ✦
          </Heading>

          <Text style={{ fontSize: 16, color: '#555', lineHeight: 1.6, marginBottom: 32 }}>
            Hi {guestName}, your RSVP for <strong>{eventTitle}</strong> is confirmed.
          </Text>

          <Section style={{ backgroundColor: '#fff', borderRadius: 16, padding: '24px 32px', marginBottom: 32 }}>
            <Text style={{ margin: '0 0 8px', color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              When
            </Text>
            <Text style={{ margin: '0 0 20px', color: '#1a1a1a', fontSize: 15, fontWeight: 500 }}>
              {eventDate} · {eventTime}
            </Text>

            <Text style={{ margin: '0 0 8px', color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              Where
            </Text>
            <Text style={{ margin: 0, color: '#1a1a1a', fontSize: 15, fontWeight: 500 }}>
              {eventLocation}
            </Text>
          </Section>

          <Link
            href={eventUrl}
            style={{
              display: 'inline-block',
              backgroundColor: '#5A5A40',
              color: '#fff',
              borderRadius: 9999,
              padding: '12px 28px',
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
              marginBottom: 32,
            }}
          >
            View event page →
          </Link>

          <Hr style={{ borderColor: '#e8e4dc', marginBottom: 24 }} />

          <Text style={{ fontSize: 12, color: '#aaa', margin: 0 }}>
            Powered by{' '}
            <Link href="https://gatherly.app" style={{ color: '#5A5A40' }}>
              Gatherly
            </Link>
          </Text>

        </Container>
      </Body>
    </Html>
  )
}
