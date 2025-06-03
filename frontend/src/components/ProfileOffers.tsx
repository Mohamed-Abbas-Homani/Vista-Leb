import React, { useEffect, useState } from "react";
import axios from "axios";

interface Offer {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  start_date: string; // ISO date string
  end_date: string;   // ISO date string
  photo: string | null;
}

interface ProfileOffersProps {
  businessId: string | null;
  token: string;
  condition?: any;
}

const ProfileOffers: React.FC<ProfileOffersProps> = ({ businessId, token, condition }) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!businessId) return;

    const fetchOffers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get<Offer[]>(
          `http://127.0.0.1:8000/api/v1/offers/business/${businessId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOffers(response.data);
      } catch (err) {
        setError("Failed to fetch offers.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [businessId, token, condition]);

  if (loading) return <p style={styles.loading}>Loading offers...</p>;
  if (error) return <p style={styles.error}>{error}</p>;
  if (!offers.length) return <p style={styles.noOffers}>No offers available.</p>;

  return (
    <section style={styles.container}>
      <h3 style={styles.title}>Current Offers</h3>
      <div style={styles.grid}>
        {offers.map((offer) => (
          <article key={offer.id} style={styles.card}>
            {offer.photo && (
              <img
                src={`http://localhost:8000${offer.photo}`}
                alt={offer.name}
                style={styles.image}
                loading="lazy"
              />
            )}
            <div style={styles.content}>
              <h4 style={styles.offerName}>{offer.name}</h4>
              {offer.description && <p style={styles.description}>{offer.description}</p>}
              <p style={styles.dates}>
                Valid:{" "}
                <time dateTime={offer.start_date}>
                  {new Date(offer.start_date).toLocaleDateString()}
                </time>{" "}
                -{" "}
                <time dateTime={offer.end_date}>
                  {new Date(offer.end_date).toLocaleDateString()}
                </time>
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: 900,
    margin: "2rem auto",
    padding: "0 1rem",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  title: {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#2c3e50",
    marginBottom: "1.5rem",
    textAlign: "center",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.5rem",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    overflow: "hidden",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
  },
  image: {
    width: "100%",
    height: 160,
    objectFit: "cover",
    borderBottom: "1px solid #eee",
  },
  content: {
    padding: "1rem",
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
  },
  offerName: {
    fontSize: "1.25rem",
    fontWeight: 600,
    marginBottom: "0.5rem",
    color: "#34495e",
  },
  description: {
    fontSize: "1rem",
    color: "#7f8c8d",
    marginBottom: "auto",
  },
  dates: {
    fontSize: "0.9rem",
    color: "#95a5a6",
    marginTop: "1rem",
    fontStyle: "italic",
  },
  loading: {
    textAlign: "center",
    color: "#2980b9",
    fontSize: "1.2rem",
    marginTop: "2rem",
  },
  error: {
    textAlign: "center",
    color: "#e74c3c",
    fontSize: "1.2rem",
    marginTop: "2rem",
  },
  noOffers: {
    textAlign: "center",
    color: "#95a5a6",
    fontSize: "1.2rem",
    marginTop: "2rem",
  },
};

export default ProfileOffers;
