"use client";

import { FormEvent, useState } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <>
      <Header />
      <main className="page">
        <div className="page-inner">
          <div className="eyebrow">Aero Publishing</div>
          <h1>Contact</h1>
          <p>
            Tell us about your manuscript and the package you are considering. Anees and the publishing team use this to set up your kickoff call.
          </p>
          <form className="panel" onSubmit={submit}>
            <div className="field">
              <label htmlFor="cname">Name</label>
              <input id="cname" name="name" required placeholder="Your name" />
            </div>
            <div className="field">
              <label htmlFor="cemail">Email</label>
              <input id="cemail" name="email" type="email" required placeholder="you@email.com" />
            </div>
            <div className="field">
              <label htmlFor="cmsg">Message</label>
              <textarea id="cmsg" name="message" rows={5} required placeholder="What is your book about, and which package are you looking at?" />
            </div>
            <button className="btn btn-accent" type="submit">Send message</button>
            {sent && (
              <div className="success" role="status">
                Message received. We will reply about your book and the next step with Anees.
              </div>
            )}
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
