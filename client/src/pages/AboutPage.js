import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const AboutPage = () => {
  return (
    <Container>
      <h1 className="my-4 text-center">About ArtiFx</h1>
      
      <Row className="mb-5">
        <Col md={8} className="mx-auto">
          <Card className="shadow-sm">
            <Card.Body className="p-5">
              <h2 className="mb-4">Our Story</h2>
              <p>
                Founded in 2025, ArtiFx is a passion project born from a deep love of music and a desire to create a community where musicians and collectors can find quality instruments and vinyl records.
              </p>
              <p>
                Our mission is to provide both new and used musical equipment at fair prices, while offering a platform for musicians to buy, sell, and trade their gear. We believe that every instrument has a story, and we're here to help continue that story with a new owner.
              </p>
              <p>
                Whether you're a seasoned professional, a weekend warrior, or just starting your musical journey, ArtiFx has something for everyone. From vintage guitars to modern keyboards, rare vinyl pressings to mainstream releases - we've got you covered.
              </p>
              
              <h2 className="mt-5 mb-4">What Makes Us Different</h2>
              <ul>
                <li>Curated selection of new and used instruments</li>
                <li>Community-driven marketplace</li>
                <li>Expert staff with decades of combined musical experience</li>
                <li>Commitment to quality and fair pricing</li>
                <li>Supporting local musicians and the music community</li>
              </ul>
              
              <h2 className="mt-5 mb-4">Visit Us</h2>
              <p>
                We're located in the heart of downtown. Come visit our store to see our full inventory, test out instruments, or just talk music with our knowledgeable staff.
              </p>
              <p>
                <strong>Address:</strong> 123 Music Avenue, Suite 101<br />
                <strong>Hours:</strong> Monday-Saturday: 10am-7pm, Sunday: 12pm-5pm<br />
                <strong>Phone:</strong> (555) 123-4567<br />
                <strong>Email:</strong> info@artifx.com
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AboutPage;