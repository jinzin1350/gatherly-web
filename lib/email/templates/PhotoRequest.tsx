import {
  Html, Head, Preview, Body, Container,
  Section, Heading, Text, Hr, Link,
} from '@react-email/components'

interface Props {
  guestName:  string
  eventTitle: string
  uploadUrl:  string
}

export function PhotoRequest({ guestName, eventTitle, uploadUrl }: Props) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Share your photos from {eventTitle}</Preview>
      <Body style={{ backgroundColor: '#FDFBF7', fontFamily: 'Georgia, serif', margin: 0 }}>
        <Container style={{ maxWidth: 560, margin: '48px auto', padding: '0 24px' }}>

          <Heading style={{ fontSize: 32, fontWeight: 300, color: '#1a1a1a', marginBottom: 8 }}>
            Share the memories ✦
          </Heading>

          <Text style={{ fontSize: 16, color: '#555', lineHeight: 1.6, marginBottom: 32 }}>
            Hi {guestName}, hope you had a wonderful time at <strong>{eventTitle}</strong>.
            Share your photos so everyone can relive the moment.
          </Text>

          <Link
            href={uploadUrl}
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
            Upload my photos →
          </Link>

          <Section style={{ backgroundColor: '#fff', borderRadius: 16, padding: '20px 28px', marginBottom: 32 }}>
            <Text style={{ margin: 0, fontSize: 13, color: '#888', lineHeight: 1.6 }}>
              This link is unique to you and expires in 30 days.
              You can upload multiple photos and they&apos;ll appear in the event gallery.
            </Text>
          </Section>

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
