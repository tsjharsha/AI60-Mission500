import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { supabaseServer } from "@/lib/supabase/server";
import { runDeterministicEngine } from "@/lib/project-dna/deterministicEngine";
import { getProjectByName } from "@/lib/projects";
import { demo } from "@/lib/server/demo";
import { builderSession, setBuilderSession } from "@/lib/server/session";
import {
  fail,
  field,
  HttpError,
  limit,
  readBody,
  record,
  uuid,
} from "@/lib/server/http";
export async function POST(req: Request) {
  try {
    limit(req, "register");
    const body = await readBody(req);
    const data = record(body.data);
    const name = field(data.name, "name", 80);
    const college = field(data.college, "college", 120);
    const email = field(data.email, "email", 254).toLowerCase();
    const phone = field(data.phone, "phone", 25, false).replace(/[\s()-]/g, "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw new HttpError("Enter a valid email.");
    if (phone && !/^\+?\d{10,15}$/.test(phone))
      throw new HttpError("Enter a valid phone number or leave it blank.");
    if (body.consent !== true)
      throw new HttpError("Workshop registration consent is required.");
    const existing = await builderSession();
    if (existing && (supabaseServer || demo.builders.has(existing.userId))) {
      return NextResponse.json({
        userId: existing.userId,
        builderNumber: existing.builderNumber,
        mode: existing.mode,
      });
    }
    const skills = Array.isArray(data.skills)
      ? data.skills
          .filter((s): s is string => typeof s === "string" && s.length < 31)
          .slice(0, 12)
      : [];
    const profile = {
      name,
      college,
      branch: field(data.branch, "branch", 60, false) || "Computer Science",
      graduationYear: field(data.graduationYear, "graduation year", 4),
      targetRole:
        field(data.targetRole, "role", 60, false) || "Software Engineer",
      skills,
      aiExperience:
        field(data.aiExperience, "experience", 30, false) || "Beginner",
    };
    if (!/^20\d{2}$/.test(profile.graduationYear))
      throw new HttpError("Enter your graduation year.");
    const preferred = getProjectByName(
      record(record(body.projectResult).project).name as string,
    );
    const result = runDeterministicEngine(profile);
    result.project = {
      ...result.project,
      name: preferred.name,
      description: preferred.description,
      skills: preferred.skills,
    };
    result.squadRole = preferred.role;
    const referral = record(body.referralContext);
    const referrer =
      typeof referral.referrerId === "string" && uuid(referral.referrerId)
        ? referral.referrerId
        : null;
    const source = field(referral.source, "source", 60, false) || "direct";
    let userId = randomUUID();
    let builderNumber = demo.builders.size + 1;
    const mode = supabaseServer ? "LIVE" : "SIMULATION";
    // Signing must be configured before performing database writes.
    const response = NextResponse.json({});
    setBuilderSession(response, userId, builderNumber, mode);
    if (supabaseServer) {
      const { data: saved, error } = await supabaseServer.rpc("ai60_register", {
        p_profile: profile,
        p_project: result,
        p_email: email,
        p_phone: phone || null,
        p_source: source,
        p_referrer: referrer,
        p_squad_code:
          field(referral.squadCode, "invite code", 20, false) || null,
      });
      if (error) {
        if (error.code === "23505")
          throw new HttpError(
            "This email is already registered. Use your existing workshop session or contact the organizer.",
            409,
          );
        throw new Error(
          "Registration transaction failed. Check the required migration and database availability.",
        );
      }
      userId = saved.userId;
      builderNumber = saved.builderNumber;
    } else {
      demo.builders.set(userId, {
        id: userId,
        number: builderNumber,
        profile,
        project: result,
      });
    }
    const savedResponse = NextResponse.json(
      { userId, builderNumber, mode },
      { status: 201 },
    );
    setBuilderSession(savedResponse, userId, builderNumber, mode);
    return savedResponse;
  } catch (error) {
    return fail(error);
  }
}
